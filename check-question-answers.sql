-- Check if question_answers table exists and view its contents
SELECT * FROM question_answers ORDER BY answered_at DESC LIMIT 20;

-- Check the structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'question_answers';

