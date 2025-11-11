import { supabase, QuizQuestion, QuizState } from './supabase';

const BOT_USERNAME = '🤖 Kviz Bot';

// Normalize Serbian text for comparison (remove diacritics)
export function normalizeSerbianText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Handle digraphs first (before single character replacements)
    .replace(/dž/g, 'dz')
    .replace(/đ/g, 'dj')
    // Now handle remaining special characters
    .replace(/č/g, 'c')
    .replace(/ć/g, 'c')
    .replace(/š/g, 's')
    .replace(/ž/g, 'z')
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' '); // Normalize spaces
}

// Generate hint by revealing percentage of letters
export function generateHint(answer: string, revealPercent: number): string {
  const normalized = answer.trim();
  const words = normalized.split(' ');

  return words.map(word => {
    const revealCount = Math.max(1, Math.ceil(word.length * revealPercent));
    const revealed = word.substring(0, revealCount);
    const hidden = '_'.repeat(word.length - revealCount);
    return revealed + hidden;
  }).join(' ');
}

// Get global quiz state
export async function getQuizState(): Promise<QuizState | null> {
  try {
    const { data, error } = await supabase
      .from('quiz_state')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw error;
    return data as QuizState;
  } catch (error) {
    console.error('Error getting quiz state:', error);
    return null;
  }
}

// Update global quiz state
export async function updateQuizState(updates: Partial<QuizState>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('quiz_state')
      .update(updates)
      .eq('id', 1);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating quiz state:', error);
    return false;
  }
}

export async function getRandomQuizQuestion(): Promise<QuizQuestion | null> {
  try {
    // Get all questions that are not flagged for removal
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('remove_question', false)
      .order('id', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      console.error('No quiz questions found in database');
      return null;
    }

    // Pick a random question from the results
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex] as QuizQuestion;
  } catch (error) {
    console.error('Error fetching quiz question:', error);
    return null;
  }
}

export async function postQuizQuestion(): Promise<boolean> {
  try {
    const question = await getRandomQuizQuestion();

    if (!question) {
      await postBotMessage('Izvini, ne mogu da pronađem pitanja! 😅');
      await updateQuizState({ is_active: false });
      return false;
    }

    // Format the quiz question message in Serbian (with optional image)
    const quizMessage = `
📚 **${question.category || 'Kviz'}** ${question.difficulty ? `(${question.difficulty})` : ''}

${question.question}
${question.image_url ? `\n${question.image_url}` : ''}

Napiši tačan odgovor! ✍️
    `.trim();

    // Post the quiz question to chat
    await postBotMessage(quizMessage);

    // Update global quiz state
    await updateQuizState({
      is_active: true,
      current_question_id: question.id,
      current_answer: question.answer,
      question_start_time: new Date().toISOString(),
    });

    // Set up hint timers (will be handled by a watcher)
    setupHintTimers(question.id, question.answer);

    return true;
  } catch (error) {
    console.error('Error posting quiz question:', error);
    await updateQuizState({ is_active: false });
    return false;
  }
}

// Store active timers globally
let activeTimers: { [key: number]: NodeJS.Timeout[] } = {};
let inactivityTimer: NodeJS.Timeout | null = null;

function setupHintTimers(questionId: number, answer: string) {
  // Clear any existing timers for this question
  if (activeTimers[questionId]) {
    activeTimers[questionId].forEach(timer => clearTimeout(timer));
  }

  activeTimers[questionId] = [];

  // 10 seconds - reveal 20% of letters
  const timer1 = setTimeout(async () => {
    const state = await getQuizState();
    if (state?.current_question_id === questionId && state.is_active) {
      const hint20 = generateHint(answer, 0.2);
      await postBotMessage(`💡 Hint (20%): ${hint20}`);
    }
  }, 10000);
  activeTimers[questionId].push(timer1);

  // 20 seconds - reveal 50% of letters
  const timer2 = setTimeout(async () => {
    const state = await getQuizState();
    if (state?.current_question_id === questionId && state.is_active) {
      const hint50 = generateHint(answer, 0.5);
      await postBotMessage(`💡 Hint (50%): ${hint50}`);
    }
  }, 20000);
  activeTimers[questionId].push(timer2);

  // 30 seconds - skip to next question
  const timer3 = setTimeout(async () => {
    const state = await getQuizState();
    if (state?.current_question_id === questionId && state.is_active) {
      await postBotMessage(`⏰ Vreme je isteklo! Tačan odgovor je: **${answer}**`);

      // Wait 2 seconds then post next question
      setTimeout(async () => {
        const currentState = await getQuizState();
        if (currentState?.is_active) {
          await postQuizQuestion();
        }
      }, 2000);
    }
  }, 30000);
  activeTimers[questionId].push(timer3);
}

export async function postBotMessage(content: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('messages').insert({
      username: BOT_USERNAME,
      content: content,
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error posting bot message:', error);
    return false;
  }
}

export function checkAnswer(userAnswer: string, correctAnswer: string): { correct: boolean; similarity: number } {
  const normalizedUser = normalizeSerbianText(userAnswer);
  const normalizedCorrect = normalizeSerbianText(correctAnswer);

  // Exact match
  if (normalizedUser === normalizedCorrect) {
    return { correct: true, similarity: 100 };
  }

  // Check if answer is contained in the correct answer or vice versa
  if (normalizedCorrect.includes(normalizedUser) || normalizedUser.includes(normalizedCorrect)) {
    return { correct: true, similarity: 90 };
  }

  // Calculate similarity (simple word matching)
  const userWords = normalizedUser.split(' ');
  const correctWords = normalizedCorrect.split(' ');

  const matchingWords = userWords.filter(word =>
    correctWords.some(cw => cw.includes(word) || word.includes(cw))
  );

  const similarity = (matchingWords.length / Math.max(userWords.length, correctWords.length)) * 100;

  // Consider it correct if 70% similarity
  return {
    correct: similarity >= 70,
    similarity: Math.round(similarity)
  };
}

// Calculate points based on time elapsed
function calculatePoints(timeElapsed: number): number {
  if (timeElapsed <= 10) {
    return 3; // Before first hint
  } else if (timeElapsed <= 20) {
    return 2; // After first hint, before second
  } else if (timeElapsed <= 30) {
    return 1; // After second hint
  }
  return 0; // After timeout (shouldn't happen but just in case)
}

// Save user score to database and return new total
async function saveUserScore(username: string, points: number): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('upsert_user_score', {
      p_username: username,
      p_points: points
    });

    if (error) {
      console.error('Error saving user score:', error);
      return 0;
    }

    console.log('RPC returned total_points:', data);

    // RPC function now returns the new total_points
    return data || 0;
  } catch (error) {
    console.error('Error saving user score:', error);
    return 0;
  }
}

export async function handleAnswerCheck(userAnswer: string, username: string): Promise<void> {
  const state = await getQuizState();

  // Check if quiz is not active
  if (!state || !state.is_active) {
    // Only respond if the message looks like an attempt to answer (short, single word)
    const looksLikeAnswer = userAnswer.trim().length > 0 &&
      userAnswer.trim().length < 50 &&
      userAnswer.trim().split(/\s+/).length <= 3;

    if (looksLikeAnswer) {
      await postBotMessage(`${username}, kviz trenutno nije aktivan! 🤖\nKlikni na "Pokreni Kviz" dugme da započneš igru! 🎮`);
    }
    return;
  }

  if (!state.current_answer) {
    return; // No active question
  }

  const result = checkAnswer(userAnswer, state.current_answer);

  if (result.correct) {
    // Clear timers for this question
    if (state.current_question_id && activeTimers[state.current_question_id]) {
      activeTimers[state.current_question_id].forEach(timer => clearTimeout(timer));
      delete activeTimers[state.current_question_id];
    }

    // Calculate time elapsed
    let timeElapsed = 0;
    if (state.question_start_time) {
      timeElapsed = Math.round((Date.now() - new Date(state.question_start_time).getTime()) / 1000);
    } else {
      console.warn('Question start time is missing! Defaulting to 25 seconds (1 point)');
      timeElapsed = 25; // Default to 25s (1 point) if start time is missing
    }

    console.log('Time elapsed:', timeElapsed, 'seconds');
    console.log('Question start time:', state.question_start_time);

    // Calculate points (clamp timeElapsed to 30 seconds max to avoid 0 points)
    const clampedTime = Math.min(Math.max(timeElapsed, 0), 30);
    const points = calculatePoints(clampedTime);

    console.log('Clamped time:', clampedTime, 'Calculated points:', points);

    // Save score to database and get new total
    const totalScore = await saveUserScore(username, points);

    // Message with points
    let pointsEmoji = '';
    if (points === 3) pointsEmoji = '🏆';
    else if (points === 2) pointsEmoji = '🥈';
    else if (points === 1) pointsEmoji = '🥉';

    await postBotMessage(`🎉 Bravo, ${username}! Dobili ste ${points} ${points === 1 ? 'poen' : points < 5 ? 'poena' : 'poena'}! ${pointsEmoji}\n💯 Ukupno: ${totalScore} ${totalScore === 1 ? 'poen' : totalScore < 5 ? 'poena' : 'poena'}!`);

    // Clear current question and wait before posting next one
    await updateQuizState({
      current_question_id: null,
      current_answer: null,
      question_start_time: null,
    });

    // Check if quiz is still active and post next question
    setTimeout(async () => {
      const currentState = await getQuizState();
      if (currentState?.is_active) {
        await postQuizQuestion();
      }
    }, 2000);

  } else if (result.similarity > 40) {
    // Close but not quite
    await postBotMessage(`🤔 Blizu si ${username}! Pokušaj ponovo...`);
  }
  // Don't respond if answer is too far off
}

// Get leaderboard
export async function getLeaderboard(limit: number = 10): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('user_scores')
      .select('*')
      .order('total_points', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

export async function stopQuiz(sendMessage: boolean = true): Promise<void> {
  // Clear all active timers
  Object.values(activeTimers).forEach(timers => {
    timers.forEach(timer => clearTimeout(timer));
  });
  activeTimers = {};

  // Clear inactivity timer
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }

  // Post stop message only if requested
  if (sendMessage) {
    await postBotMessage('🛑 Kviz je zaustavljen!\n\nKlikni na "Pokreni Kviz" dugme da nastaviš igru! 🎮');
  }

  await updateQuizState({
    is_active: false,
    current_question_id: null,
    current_answer: null,
    question_start_time: null,
  });
}

export async function startQuiz(): Promise<void> {
  // Clear any existing timers before starting
  Object.values(activeTimers).forEach(timers => {
    timers.forEach(timer => clearTimeout(timer));
  });
  activeTimers = {};
  
  // Clear any existing inactivity timer
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }

  // Post question and start quiz
  await postQuizQuestion();
  
  // Start inactivity timer
  resetInactivityTimer();
}

// Restart quiz (secret command) - stops and immediately starts again
export async function restartQuiz(): Promise<void> {
  console.log('🔄 Restarting quiz...');
  
  // Stop quiz silently (no message)
  await stopQuiz(false);
  
  // Wait a moment to ensure state is cleared
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Start quiz
  await startQuiz();
  
  console.log('✅ Quiz restarted successfully!');
}

// Reset inactivity timer - call this when user sends a message
export function resetInactivityTimer(): void {
  // Clear existing timer
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }

  // Set new timer for 5 minutes
  inactivityTimer = setTimeout(async () => {
    try {
      const state = await getQuizState();
      if (state?.is_active) {
        await postBotMessage('⏰ Kviz je zaustavljen zbog neaktivnosti (5 minuta).\n\nKlikni na "Pokreni Kviz" dugme da nastaviš igru! 🎮');
        await stopQuiz(false); // Don't send duplicate message
      }
    } catch (error) {
      console.error('Error in inactivity timer:', error);
    }
  }, 5 * 60 * 1000); // 5 minutes
}

// Clear inactivity timer
export function clearInactivityTimer(): void {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
}
