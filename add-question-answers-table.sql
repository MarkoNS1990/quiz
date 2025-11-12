-- Create table to track all correct answers for each question
CREATE TABLE IF NOT EXISTS question_answers (
  id BIGSERIAL PRIMARY KEY,
  question_id BIGINT NOT NULL,
  username TEXT NOT NULL,
  points INTEGER NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(question_id, username) -- Each user can only answer once per question
);

-- Enable Row Level Security
ALTER TABLE question_answers ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read
CREATE POLICY "Question answers are viewable by everyone"
  ON question_answers FOR SELECT
  USING (true);

-- Policy: Anyone can insert (bot will insert via API)
CREATE POLICY "Anyone can insert question answers"
  ON question_answers FOR INSERT
  WITH CHECK (true);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_question_answers_question_id 
ON question_answers(question_id);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE question_answers;

