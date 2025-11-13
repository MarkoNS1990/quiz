-- Delete all quiz questions that don't have a custom_category
-- WARNING: This will permanently delete questions where custom_category is NULL

DELETE FROM quiz_questions
WHERE custom_category IS NULL;

-- To see how many questions would be deleted first, run this query:
-- SELECT COUNT(*) FROM quiz_questions WHERE custom_category IS NULL;

-- To see which questions would be deleted, run this query:
-- SELECT id, question, answer, category FROM quiz_questions WHERE custom_category IS NULL LIMIT 20;

