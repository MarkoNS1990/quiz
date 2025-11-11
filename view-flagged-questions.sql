-- View all flagged questions
-- Use this to see which questions users have marked as "stupid"

-- Count of flagged questions
SELECT 
  COUNT(*) as total_flagged,
  COUNT(*) * 100.0 / (SELECT COUNT(*) FROM quiz_questions) as percentage_flagged
FROM quiz_questions 
WHERE remove_question = true;

-- List all flagged questions with details
SELECT 
  id,
  question,
  answer,
  category,
  difficulty,
  created_at
FROM quiz_questions 
WHERE remove_question = true
ORDER BY id DESC;

-- Summary by category
SELECT 
  category,
  COUNT(*) as flagged_count
FROM quiz_questions 
WHERE remove_question = true
GROUP BY category
ORDER BY flagged_count DESC;

-- Summary by difficulty
SELECT 
  difficulty,
  COUNT(*) as flagged_count
FROM quiz_questions 
WHERE remove_question = true
GROUP BY difficulty
ORDER BY flagged_count DESC;

