-- Test query to see all custom categories
SELECT DISTINCT custom_category, COUNT(*) as pitanja
FROM quiz_questions 
WHERE custom_category IS NOT NULL 
  AND remove_question = FALSE
GROUP BY custom_category
ORDER BY custom_category;

-- See all questions with custom_category
SELECT id, question, category, custom_category, remove_question
FROM quiz_questions
WHERE custom_category IS NOT NULL
ORDER BY custom_category, id
LIMIT 20;

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'quiz_questions';

-- Check RLS policies on quiz_questions
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'quiz_questions';

