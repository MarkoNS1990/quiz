import { supabase, QuizState, getQuestionAnswers, clearQuestionAnswers } from './supabase';
import { postBotMessage, getQuizState, postQuizQuestion } from './quizBot';

// Lock to prevent multiple simultaneous checks
let isCheckingTimeout = false;
let lastCheckTime = 0;
const MIN_CHECK_INTERVAL = 1000; // Minimum 1 second between checks

/**
 * Check if current question has timed out and needs to be ended
 * This is called when user enters/returns to the app
 */
export async function checkAndHandleTimeout(): Promise<void> {
  // Prevent multiple simultaneous checks
  const now = Date.now();
  if (isCheckingTimeout || (now - lastCheckTime) < MIN_CHECK_INTERVAL) {
    console.log('⏰ Check already in progress or too soon, skipping');
    return;
  }

  isCheckingTimeout = true;
  lastCheckTime = now;

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

    // If more than 30 seconds have passed, end the question immediately
    if (elapsedSeconds >= 30) {
      console.log('⏰ Question timed out! Ending it now...');
      
      // Get the correct answer and question ID from current state
      const correctAnswer = state.current_answer || 'Nepoznato';
      const questionId = state.current_question_id;
      
      // Safety check - should never be null here, but TypeScript requires it
      if (!questionId) {
        console.error('⚠️ Question ID is null, cannot fetch answers');
        return;
      }
      
      // Fetch all answers from database
      const answers = await getQuestionAnswers(questionId);
      
      // Show correct answer and summary
      if (answers.length === 0) {
        await postBotMessage(`⏰ Vreme je isteklo! Niko nije pogodio.\n\nTačan odgovor je: **${correctAnswer}**`);
      } else {
        // Create summary message
        let summary = `⏰ Vreme je isteklo! Tačan odgovor: **${correctAnswer}**\n\n📊 **Rezultati:**\n`;
        
        // Sort by points (highest first) then by answered_at (fastest first)
        const sortedAnswers = answers.sort((a, b) => {
          if (b.points !== a.points) {
            return b.points - a.points;
          }
          return new Date(a.answered_at).getTime() - new Date(b.answered_at).getTime();
        });

        // Fetch total points for all users who answered
        const usernames = sortedAnswers.map(answer => answer.username);
        const { data: userScores, error: scoresError } = await supabase
          .from('user_scores')
          .select('username, total_points')
          .in('username', usernames);

        // Create a map of username -> total_points
        const totalPointsMap = new Map<string, number>();
        if (userScores && !scoresError) {
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
      
      // Atomically clear the question ONLY if it's still the same question
      // This prevents race conditions when multiple users return simultaneously
      const { data, error } = await supabase
        .from('quiz_state')
        .update({
          current_question_id: null,
          current_answer: null,
          question_start_time: null,
        })
        .eq('id', 1)
        .eq('current_question_id', questionId) // Only update if still this question
        .select();

      if (error) {
        console.error('Error clearing timed out question:', error);
        return;
      }

      // If no rows were updated, another user already handled this
      if (!data || data.length === 0) {
        console.log('⏰ Question already handled by another user');
        return;
      }

      // Wait 2 seconds then post next question
      setTimeout(async () => {
        const currentState = await getQuizState();
        // Double-check that there's no active question before posting new one
        if (currentState?.is_active && !currentState.current_question_id) {
          await postQuizQuestion();
        }
      }, 2000);
    } else if (elapsedSeconds < 30) {
      // Question is still active but timers were stopped (all users left)
      // Resume the question with remaining time
      console.log(`⏰ Resuming question with ${30 - elapsedSeconds}s remaining`);
      
      const remainingTime = (30 - elapsedSeconds) * 1000;
      const correctAnswer = state.current_answer || 'Nepoznato';
      
      // Set timer to end question when time runs out
      setTimeout(async () => {
        const currentState = await getQuizState();
        // Only end if it's still the same question
        if (currentState?.current_question_id === state.current_question_id) {
          console.log('⏰ Resumption timer expired, ending question');
          
          // Get updated state for correct answer
          const latestState = await getQuizState();
          const finalAnswer = latestState?.current_answer || correctAnswer;
          const finalQuestionId = state.current_question_id;
          
          // Safety check - should never be null here, but TypeScript requires it
          if (!finalQuestionId) {
            console.error('⚠️ Question ID is null, cannot fetch answers');
            return;
          }
          
          // Fetch all answers from database
          const answers = await getQuestionAnswers(finalQuestionId);
          
          // Show correct answer and summary
          if (answers.length === 0) {
            await postBotMessage(`⏰ Vreme je isteklo! Niko nije pogodio.\n\nTačan odgovor je: **${finalAnswer}**`);
          } else {
            // Create summary message
            let summary = `⏰ Vreme je isteklo! Tačan odgovor: **${finalAnswer}**\n\n📊 **Rezultati:**\n`;
            
            // Sort by points (highest first) then by answered_at (fastest first)
            const sortedAnswers = answers.sort((a, b) => {
              if (b.points !== a.points) {
                return b.points - a.points;
              }
              return new Date(a.answered_at).getTime() - new Date(b.answered_at).getTime();
            });

            // Fetch total points for all users who answered
            const usernames = sortedAnswers.map(answer => answer.username);
            const { data: userScores, error: scoresError } = await supabase
              .from('user_scores')
              .select('username, total_points')
              .in('username', usernames);

            // Create a map of username -> total_points
            const totalPointsMap = new Map<string, number>();
            if (userScores && !scoresError) {
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
          await clearQuestionAnswers(finalQuestionId);
          
          const { data, error } = await supabase
            .from('quiz_state')
            .update({
              current_question_id: null,
              current_answer: null,
              question_start_time: null,
            })
            .eq('id', 1)
            .eq('current_question_id', state.current_question_id)
            .select();

          if (error || !data || data.length === 0) {
            console.log('⏰ Question already handled');
            return;
          }

          setTimeout(async () => {
            const nextState = await getQuizState();
            if (nextState?.is_active && !nextState.current_question_id) {
              await postQuizQuestion();
            }
          }, 2000);
        }
      }, remainingTime);
    }
  } catch (error) {
    console.error('Error checking quiz timeout:', error);
  } finally {
    isCheckingTimeout = false;
  }
}

