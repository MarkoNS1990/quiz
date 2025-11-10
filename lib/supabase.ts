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
  hint: string | null;
  category: string | null;
  difficulty: 'lako' | 'srednje' | 'teško' | null;
  created_at: string;
};
