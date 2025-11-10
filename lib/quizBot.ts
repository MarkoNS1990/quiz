import { supabase, QuizQuestion } from './supabase';

const BOT_USERNAME = '🤖 Kviz Bot';
let quizActive = false;
let currentQuestionStartTime: number | null = null;
let hintTimer20: NodeJS.Timeout | null = null;
let hintTimer40: NodeJS.Timeout | null = null;
let skipTimer60: NodeJS.Timeout | null = null;

// Normalize Serbian text for comparison (remove diacritics)
export function normalizeSerbianText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/č/g, 'c')
    .replace(/ć/g, 'c')
    .replace(/š/g, 's')
    .replace(/ž/g, 'z')
    .replace(/đ/g, 'd')
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

// Clear all timers
function clearAllTimers() {
  if (hintTimer20) clearTimeout(hintTimer20);
  if (hintTimer40) clearTimeout(hintTimer40);
  if (skipTimer60) clearTimeout(skipTimer60);
  hintTimer20 = null;
  hintTimer40 = null;
  skipTimer60 = null;
}

export async function getRandomQuizQuestion(): Promise<QuizQuestion | null> {
  try {
    // Get a random question from the database
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
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
    // Clear any existing timers
    clearAllTimers();
    
    const question = await getRandomQuizQuestion();
    
    if (!question) {
      await postBotMessage('Izvini, ne mogu da pronađem pitanja! 😅');
      quizActive = false;
      return false;
    }

    // Format the quiz question message in Serbian (without options)
    const quizMessage = `
📚 **${question.category || 'Kviz'}** ${question.difficulty ? `(${question.difficulty})` : ''}

${question.question}

${question.hint ? `💡 Hint: ${question.hint}` : ''}

Napiši tačan odgovor! ✍️
    `.trim();

    // Post the quiz question to chat
    await postBotMessage(quizMessage);
    
    // Store the correct answer and start time
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('currentQuizAnswer', question.answer);
      sessionStorage.setItem('currentQuizId', question.id.toString());
      sessionStorage.setItem('quizActive', 'true');
      sessionStorage.setItem('questionStartTime', Date.now().toString());
    }
    
    quizActive = true;
    currentQuestionStartTime = Date.now();
    
    // Set up hint timers
    setupHintTimers(question.answer);
    
    return true;
  } catch (error) {
    console.error('Error posting quiz question:', error);
    quizActive = false;
    return false;
  }
}

function setupHintTimers(answer: string) {
  // 10 seconds - reveal 20% of letters
  hintTimer20 = setTimeout(async () => {
    const hint20 = generateHint(answer, 0.2);
    await postBotMessage(`💡 Hint (20%): ${hint20}`);
  }, 10000);
  
  // 20 seconds - reveal 50% of letters
  hintTimer40 = setTimeout(async () => {
    const hint50 = generateHint(answer, 0.5);
    await postBotMessage(`💡 Hint (50%): ${hint50}`);
  }, 20000);
  
  // 30 seconds - skip to next question
  skipTimer60 = setTimeout(async () => {
    await postBotMessage(`⏰ Vreme je isteklo! Tačan odgovor je: **${answer}**`);
    
    // Clear the current quiz
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('currentQuizAnswer');
      sessionStorage.removeItem('currentQuizId');
      sessionStorage.removeItem('questionStartTime');
      
      const isActive = sessionStorage.getItem('quizActive') === 'true';
      if (isActive) {
        setTimeout(() => {
          postQuizQuestion();
        }, 2000);
      }
    }
  }, 30000);
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

export function checkAnswer(userAnswer: string): { correct: boolean; similarity: number } {
  if (typeof window === 'undefined') return { correct: false, similarity: 0 };
  
  const correctAnswer = sessionStorage.getItem('currentQuizAnswer');
  
  if (!correctAnswer) return { correct: false, similarity: 0 };
  
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

export async function handleAnswerCheck(userAnswer: string, username: string): Promise<void> {
  const result = checkAnswer(userAnswer);
  
  if (result.correct) {
    // Clear all timers since answer was found
    clearAllTimers();
    
    const timeElapsed = currentQuestionStartTime 
      ? Math.round((Date.now() - currentQuestionStartTime) / 1000) 
      : 0;
    
    await postBotMessage(`🎉 Tačno, ${username}! Bravo! 👏 (${timeElapsed}s)`);
    
    // Clear the current quiz
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('currentQuizAnswer');
      sessionStorage.removeItem('currentQuizId');
      sessionStorage.removeItem('questionStartTime');
      
      // Check if quiz is active and auto-continue
      const isActive = sessionStorage.getItem('quizActive') === 'true';
      if (isActive) {
        // Wait 2 seconds before posting next question
        setTimeout(() => {
          postQuizQuestion();
        }, 2000);
      }
    }
  } else if (result.similarity > 40) {
    // Close but not quite
    await postBotMessage(`🤔 Blizu si ${username}! Pokušaj ponovo...`);
  }
  // Don't respond if answer is too far off
}

export function stopQuiz(): void {
  clearAllTimers();
  
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('quizActive', 'false');
    sessionStorage.removeItem('currentQuizAnswer');
    sessionStorage.removeItem('currentQuizId');
    sessionStorage.removeItem('questionStartTime');
  }
  quizActive = false;
}

export function isQuizActive(): boolean {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('quizActive') === 'true';
  }
  return quizActive;
}
