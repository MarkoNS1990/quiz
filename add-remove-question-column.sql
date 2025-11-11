-- Add remove_question column to quiz_questions table
-- This allows users to flag questions as "stupid" for review

ALTER TABLE quiz_questions 
ADD COLUMN IF NOT EXISTS remove_question BOOLEAN DEFAULT FALSE;

-- Create index for filtering out flagged questions
CREATE INDEX IF NOT EXISTS idx_quiz_questions_remove_question 
ON quiz_questions(remove_question) 
WHERE remove_question = FALSE;

-- Add RLS policy to allow anyone to update the remove_question field
-- Drop policy if it exists, then create it
DROP POLICY IF EXISTS "Anyone can flag questions for removal" ON quiz_questions;

CREATE POLICY "Anyone can flag questions for removal"
  ON quiz_questions FOR UPDATE
  USING (true)
  WITH CHECK (true);

