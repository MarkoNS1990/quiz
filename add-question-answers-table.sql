-- Create table to track answers for current question
CREATE TABLE IF NOT EXISTS question_answers (
  id BIGSERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL,
  username TEXT NOT NULL,
  points INTEGER NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, username) -- Each user can answer each question only once
);

-- Add index for faster lookups by question_id
CREATE INDEX IF NOT EXISTS idx_question_answers_question_id 
ON question_answers(question_id);

-- Enable RLS
ALTER TABLE question_answers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (submit answers)
CREATE POLICY "Anyone can submit answers"
  ON question_answers FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read answers
CREATE POLICY "Anyone can read answers"
  ON question_answers FOR SELECT
  USING (true);

-- Allow anyone to delete (for cleanup)
CREATE POLICY "Anyone can delete answers"
  ON question_answers FOR DELETE
  USING (true);
