-- Remove hint column from quiz_questions table
-- Hints are now auto-generated at 10s (20%) and 20s (50%)

-- Drop the hint column
ALTER TABLE quiz_questions
DROP COLUMN IF EXISTS hint;

-- Verify the change
-- SELECT * FROM quiz_questions LIMIT 1;

