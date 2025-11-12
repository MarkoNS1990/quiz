import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Message = {
  id: number;
  username: string;
  content: string;
  created_at: string;
};

export type QuizQuestion = {
  id: number;
  question: string;
  answer: string;
  image_url: string | null;
  category: string | null;
  difficulty: 'lako' | 'srednje' | 'teško' | null;
  remove_question: boolean;
  created_at: string;
};

export type QuizState = {
  id: number;
  is_active: boolean;
  current_question_id: number | null;
  current_answer: string | null;
  question_start_time: string | null;
  updated_at: string;
};

export type UserScore = {
  id: number;
  username: string;
  total_points: number;
  correct_answers: number;
  three_point_answers: number;
  two_point_answers: number;
  one_point_answers: number;
  last_updated: string;
};

export type QuestionAnswer = {
  id: number;
  question_id: number;
  username: string;
  points: number;
  answered_at: string;
};

/**
 * Deletes messages older than 30 minutes from the database
 * This keeps the chat clean and only shows recent messages
 */
export async function cleanupOldMessages(): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('cleanup_old_messages');
    
    if (error) {
      console.error('Error cleaning up old messages:', error);
      return false;
    }
    
    console.log('Old messages cleaned up successfully');
    return true;
  } catch (error) {
    console.error('Error calling cleanup function:', error);
    return false;
  }
}

/**
 * Flags a quiz question as "stupid" for review
 * This allows users to report questions they think should be removed
 */
export async function flagQuestionForRemoval(questionId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('quiz_questions')
      .update({ remove_question: true })
      .eq('id', questionId);
    
    if (error) {
      console.error('Error flagging question:', error);
      return false;
    }
    
    console.log('Question flagged successfully');
    return true;
  } catch (error) {
    console.error('Error flagging question:', error);
    return false;
  }
}

/**
 * Save a correct answer to the database
 */
export async function saveQuestionAnswer(
  questionId: number,
  username: string,
  points: number
): Promise<boolean> {
  try {
    console.log(`💾 Attempting to save answer: questionId=${questionId}, username=${username}, points=${points}`);
    
    const { data, error } = await supabase
      .from('question_answers')
      .insert({
        question_id: questionId,
        username,
        points,
      })
      .select();
    
    if (error) {
      console.error('❌ Error saving answer to database:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return false;
    }
    
    console.log('✅ Answer saved successfully:', data);
    return true;
  } catch (error) {
    console.error('❌ Exception saving answer:', error);
    return false;
  }
}

/**
 * Get all answers for a specific question
 */
export async function getQuestionAnswers(questionId: number): Promise<QuestionAnswer[]> {
  try {
    console.log(`📖 Fetching answers for question ${questionId}`);
    
    const { data, error } = await supabase
      .from('question_answers')
      .select('*')
      .eq('question_id', questionId)
      .order('answered_at', { ascending: true });
    
    if (error) {
      console.error('❌ Error fetching answers:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return [];
    }
    
    console.log(`✅ Fetched ${data?.length || 0} answers:`, data);
    return data as QuestionAnswer[];
  } catch (error) {
    console.error('❌ Exception fetching answers:', error);
    return [];
  }
}

/**
 * Clear all answers for a specific question
 */
export async function clearQuestionAnswers(questionId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('question_answers')
      .delete()
      .eq('question_id', questionId);
    
    if (error) {
      console.error('Error clearing answers:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing answers:', error);
    return false;
  }
}