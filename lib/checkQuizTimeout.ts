import { supabase, QuizState } from './supabase';
import { postBotMessage, getQuizState, postQuizQuestion } from './quizBot';

/**
 * Check if current question has timed out and needs to be ended
 * This is called when user enters/returns to the app
 */
export async function checkAndHandleTimeout(): Promise<void> {
  try {
    const state = await getQuizState();
    
    if (!state || !state.is_active) {
      return; // Quiz not active
    }

    if (!state.current_question_id || !state.question_start_time) {
      return; // No active question
    }

    // Calculate how much time has passed
    const startTime = new Date(state.question_start_time).getTime();
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - startTime) / 1000);

    console.log(`⏰ Question elapsed time: ${elapsedSeconds}s`);

    // If more than 30 seconds have passed, end the question
    if (elapsedSeconds >= 30) {
      console.log('⏰ Question timed out! Ending it now...');
      
      // Get the correct answer from current state
      const correctAnswer = state.current_answer || 'Nepoznato';
      
      // Post timeout message
      await postBotMessage(`⏰ Vreme je isteklo! Tačan odgovor je: **${correctAnswer}**`);
      
      // Clear the question
      const { error } = await supabase
        .from('quiz_state')
        .update({
          current_question_id: null,
          current_answer: null,
          question_start_time: null,
        })
        .eq('id', 1);

      if (error) {
        console.error('Error clearing timed out question:', error);
        return;
      }

      // Wait 2 seconds then post next question
      setTimeout(async () => {
        const currentState = await getQuizState();
        if (currentState?.is_active) {
          await postQuizQuestion();
        }
      }, 2000);
    }
  } catch (error) {
    console.error('Error checking quiz timeout:', error);
  }
}

