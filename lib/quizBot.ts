import { supabase, QuizQuestion, QuizState, saveQuestionAnswer, getQuestionAnswers, clearQuestionAnswers } from './supabase';

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
    // Get current quiz state to check for category filter
    const state = await getQuizState();
    const selectedCategories = state?.selected_categories;

    console.log('🎲 Getting random question...');
    console.log('📂 Selected categories from state:', selectedCategories);

    let query = supabase
      .from('quiz_questions')
      .select('*')
      .eq('remove_question', false);

    // If categories are selected, filter by them
    if (selectedCategories && selectedCategories.length > 0) {
      console.log('🔍 Filtering by categories:', selectedCategories);
      query = query.in('custom_category', selectedCategories);
    } else {
      console.log('📖 No category filter - showing all questions');
    }

    const { data, error } = await query.order('id', { ascending: false });

    console.log('📊 Query returned', data?.length || 0, 'questions');
    if (data && data.length > 0) {
      console.log('Sample questions:', data.slice(0, 3).map(q => ({
        id: q.id,
        question: q.question.substring(0, 50),
        custom_category: q.custom_category
      })));
    }

    if (error) throw error;

    if (!data || data.length === 0) {
      console.error('❌ No quiz questions found in database');
      return null;
    }

    // Pick a random question from the results
    const randomIndex = Math.floor(Math.random() * data.length);
    const selectedQuestion = data[randomIndex] as QuizQuestion;
    console.log('✅ Selected question:', {
      id: selectedQuestion.id,
      question: selectedQuestion.question.substring(0, 50),
      custom_category: selectedQuestion.custom_category
    });
    
    return selectedQuestion;
  } catch (error) {
    console.error('❌ Error fetching quiz question:', error);
    return null;
  }
}

export async function postQuizQuestion(): Promise<boolean> {
  try {
    // Check if there's already an active question (prevent duplicate questions)
    const currentState = await getQuizState();
    if (currentState?.current_question_id) {
      console.log('⚠️ Question already active, skipping post');
      return false;
    }

    const question = await getRandomQuizQuestion();

    if (!question) {
      await postBotMessage('Izvini, ne mogu da pronađem pitanja! 😅');
      await updateQuizState({ is_active: false });
      return false;
    }

    // Clear previous question answers from database
    if (currentState?.current_question_id) {
      await clearQuestionAnswers(currentState.current_question_id);
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
    
    // Reset inactivity timer when posting new question
    resetInactivityTimer();

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

  // 30 seconds - end question and show all who answered correctly
  const timer3 = setTimeout(async () => {
    const state = await getQuizState();
    if (state?.current_question_id === questionId && state.is_active) {
      await endQuestion(answer, questionId);
    }
  }, 30000);
  activeTimers[questionId].push(timer3);
}

// End question and show summary of all correct answers
async function endQuestion(correctAnswer: string, questionId: number, allAnswered: boolean = false): Promise<void> {
  // Fetch all answers from database
  const answers = await getQuestionAnswers(questionId);
  
  console.log('📊 Ending question. Total correct answers:', answers.length, 'All answered:', allAnswered);
  console.log('📊 Answers:', answers);
  
  // Show correct answer and summary
  if (answers.length === 0) {
    await postBotMessage(`⏰ Vreme je isteklo! Niko nije pogodio.\n\nTačan odgovor je: **${correctAnswer}**`);
  } else {
    // Create summary message - different message if all answered vs timeout
    let summary = '';
    if (allAnswered) {
      summary = `🎉 **Svi igrači su tačno odgovorili, bravo!**\n\nTačan odgovor: **${correctAnswer}**\n\n📊 **Rezultati:**\n`;
    } else {
      summary = `⏰ Vreme je isteklo! Tačan odgovor: **${correctAnswer}**\n\n📊 **Rezultati:**\n`;
    }
    
    // Sort by points (highest first) then by answered_at (fastest first)
    const sortedAnswers = answers.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return new Date(a.answered_at).getTime() - new Date(b.answered_at).getTime();
    });
    
    console.log('📊 Sorted answers:', sortedAnswers);

    // Fetch total points for all users who answered
    const usernames = sortedAnswers.map(answer => answer.username);
    const { data: userScores, error } = await supabase
      .from('user_scores')
      .select('username, total_points')
      .in('username', usernames);

    // Create a map of username -> total_points
    const totalPointsMap = new Map<string, number>();
    if (userScores && !error) {
      userScores.forEach(score => {
        totalPointsMap.set(score.username, score.total_points);
      });
    }

    sortedAnswers.forEach((answer, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '✅';
      const totalPoints = totalPointsMap.get(answer.username) || 0;
      summary += `${medal} **${answer.username}** +${answer.points} ${answer.points === 1 ? 'poen' : 'poena'} (${totalPoints})\n`;
    });

    await postBotMessage(summary);
  }
  
  // Clear answers from database after showing summary
  await clearQuestionAnswers(questionId);
  
  // Reset inactivity timer before moving to next question
  resetInactivityTimer();

  // Clear current question
  await updateQuizState({
    current_question_id: null,
    current_answer: null,
    question_start_time: null,
  });

  // Wait 3 seconds then post next question
  setTimeout(async () => {
    const currentState = await getQuizState();
    if (currentState?.is_active) {
      await postQuizQuestion();
    }
  }, 3000);
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

  // Split into words for comparison
  const userWords = normalizedUser.split(' ').filter(w => w.length > 0);
  const correctWords = normalizedCorrect.split(' ').filter(w => w.length > 0);

  // Single word answers must match exactly (with normalization)
  if (correctWords.length === 1 && userWords.length === 1) {
    // Allow minor variations (like missing one letter) but not incomplete words
    const lengthDiff = Math.abs(userWords[0].length - correctWords[0].length);
    if (lengthDiff <= 1 && correctWords[0].includes(userWords[0])) {
      return { correct: true, similarity: 95 };
    }
    return { correct: false, similarity: 0 };
  }

  // Multi-word answers: require all important words to be present
  if (correctWords.length > 1) {
    // Count how many correct words are present in user answer
    const matchedWords = correctWords.filter(cw => 
      userWords.some(uw => {
        // Words must be very similar (at least 80% match)
        const maxLen = Math.max(cw.length, uw.length);
        const minLen = Math.min(cw.length, uw.length);
        return (minLen / maxLen >= 0.8) && (cw.includes(uw) || uw.includes(cw));
      })
    );

    const matchPercentage = (matchedWords.length / correctWords.length) * 100;
    
    // Require at least 80% of words to match for multi-word answers
    return {
      correct: matchPercentage >= 80,
      similarity: Math.round(matchPercentage)
    };
  }

  // Fallback: calculate basic similarity
  const matchingWords = userWords.filter(word =>
    correctWords.some(cw => cw === word)
  );

  const similarity = (matchingWords.length / correctWords.length) * 100;

  return {
    correct: similarity >= 90,
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

// Get count of online users from presence
async function getOnlineUsersCount(): Promise<number> {
  try {
    console.log('🔍 Checking online users...');
    const channel = supabase.channel('online-users-check-' + Date.now());
    
    await channel.subscribe();
    
    // Wait a bit for presence to sync
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const presenceState = channel.presenceState();
    console.log('📊 Presence state:', presenceState);
    
    const onlineUsers = new Set<string>();
    
    Object.keys(presenceState).forEach((key) => {
      const presences = presenceState[key] as any[];
      presences.forEach((presence) => {
        console.log('👤 Found presence:', presence);
        if (presence.username) {
          onlineUsers.add(presence.username);
        }
      });
    });
    
    console.log('✅ Unique online users:', Array.from(onlineUsers));
    
    supabase.removeChannel(channel);
    return onlineUsers.size;
  } catch (error) {
    console.error('❌ Error getting online users count:', error);
    return 0;
  }
}

export async function handleAnswerCheck(userAnswer: string, username: string, onlineCount?: number): Promise<void> {
  const state = await getQuizState();

  // Check if quiz is not active
  if (!state || !state.is_active) {
    return; // Silently ignore if quiz not active
  }

  if (!state.current_answer || !state.current_question_id) {
    return; // No active question
  }

  // Check if user already answered this question (check in database)
  const existingAnswers = await getQuestionAnswers(state.current_question_id);
  const alreadyAnswered = existingAnswers.some(a => a.username === username);
  
  if (alreadyAnswered) {
    return; // User already answered, ignore duplicate
  }

  const result = checkAnswer(userAnswer, state.current_answer);

  if (result.correct) {
    console.log(`✅ ${username} answered correctly!`);
    
    // Calculate time elapsed
    let timeElapsed = 0;
    if (state.question_start_time) {
      timeElapsed = Math.round((Date.now() - new Date(state.question_start_time).getTime()) / 1000);
    } else {
      console.warn('Question start time is missing! Defaulting to 25 seconds (1 point)');
      timeElapsed = 25;
    }

    // Calculate points (clamp timeElapsed to 30 seconds max)
    const clampedTime = Math.min(Math.max(timeElapsed, 0), 30);
    const points = calculatePoints(clampedTime);
    
    console.log(`${username} gets ${points} points (time: ${clampedTime}s)`);

    // Save this user's answer to database
    await saveQuestionAnswer(state.current_question_id, username, points);
    
    // Save score to user_scores table
    await saveUserScore(username, points);

    // Announce that this user got it right
    let pointsEmoji = '';
    if (points === 3) pointsEmoji = '🏆';
    else if (points === 2) pointsEmoji = '🥈';
    else if (points === 1) pointsEmoji = '🥉';

    await postBotMessage(`✅ **${username}** je pogodio! +${points} ${points === 1 ? 'poen' : 'poena'} ${pointsEmoji}`);
    
    // Reset inactivity timer since there's activity
    resetInactivityTimer();

    // Check if all online users have answered
    const allAnswers = await getQuestionAnswers(state.current_question_id);
    
    console.log(`👥 Online users: ${onlineCount || 'unknown'}, Answered: ${allAnswers.length}`);
    
    // If all online users answered, end question immediately
    // Only auto-advance if we have onlineCount info
    if (onlineCount && onlineCount > 0 && allAnswers.length >= onlineCount) {
      console.log('🎉 All online users answered! Moving to next question...');
      
      // Clear existing timers for this question
      if (activeTimers[state.current_question_id]) {
        activeTimers[state.current_question_id].forEach(timer => clearTimeout(timer));
        delete activeTimers[state.current_question_id];
      }
      
      // Wait 2 seconds to show the last answer, then end question
      setTimeout(async () => {
        const currentState = await getQuizState();
        if (currentState?.current_question_id === state.current_question_id && currentState.is_active) {
          await endQuestion(state.current_answer, state.current_question_id, true); // true = all answered
        }
      }, 2000);
    }

  } else if (result.similarity > 40) {
    // Close but not quite - only notify the user privately would be ideal, but we'll skip for now
    // Don't announce wrong answers to keep chat clean
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
    selected_categories: null,
  });
}

export async function startQuiz(selectedCategories?: string[] | null): Promise<void> {
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

  // Update quiz state with selected categories
  console.log('💾 Saving selected categories to state:', selectedCategories);
  await updateQuizState({ 
    is_active: true,
    selected_categories: selectedCategories || null
  });

  // Verify it was saved
  const verifyState = await getQuizState();
  console.log('✅ Verified state after save:', {
    is_active: verifyState?.is_active,
    selected_categories: verifyState?.selected_categories
  });

  // Build category message
  let categoryMessage = '';
  if (selectedCategories && selectedCategories.length > 0) {
    categoryMessage = `\n📂 **Oblasti:** ${selectedCategories.join(', ')}`;
  }

  await postBotMessage(`🎮 Kviz počinje! Pripremite se... 🎯${categoryMessage}`);

  // Post question and start quiz
  await postQuizQuestion();
  
  // Start inactivity timer
  resetInactivityTimer();
}

// Restart quiz (secret command) - stops and immediately starts again
export async function restartQuiz(): Promise<void> {
  console.log('🔄 Restarting quiz...');
  
  // Get current categories before stopping
  const currentState = await getQuizState();
  const currentCategories = currentState?.selected_categories;
  
  // Stop quiz silently (no message)
  await stopQuiz(false);
  
  // Wait a moment to ensure state is cleared
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Start quiz with same categories
  await startQuiz(currentCategories);
  
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
