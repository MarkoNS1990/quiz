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
  category: string | null;
  difficulty: 'lako' | 'srednje' | 'teško' | null;
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
