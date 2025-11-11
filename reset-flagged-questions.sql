-- Reset all flagged questions back to false
-- This will make all previously flagged questions available again in the quiz

-- First, check how many flagged questions exist
SELECT COUNT(*) as total_flagged_questions 
FROM quiz_questions 
WHERE remove_question = true;

-- Reset all flagged questions to false
UPDATE quiz_questions 
SET remove_question = false 
WHERE remove_question = true;

-- Verify the reset (should show 0 flagged questions now)
SELECT COUNT(*) as remaining_flagged_questions 
FROM quiz_questions 
WHERE remove_question = true;

-- Show all questions with their flag status (optional)
SELECT id, question, remove_question 
FROM quiz_questions 
ORDER BY id;

