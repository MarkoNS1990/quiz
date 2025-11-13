-- Add recent_questions column to quiz_state table
-- This stores the last 50 question IDs to prevent repetition

ALTER TABLE quiz_state 
ADD COLUMN recent_questions INTEGER[] DEFAULT '{}';

-- Update the existing row to have an empty array
UPDATE quiz_state 
SET recent_questions = '{}' 
WHERE id = 1;

