-- Proveri da li selected_categories kolona postoji u quiz_state
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'quiz_state' 
  AND column_name = 'selected_categories';

-- Proveri trenutno stanje u quiz_state
SELECT id, is_active, selected_categories
FROM quiz_state;

-- Koliko pitanja ima custom_category = 'Zastave'?
SELECT COUNT(*) as total_zastave
FROM quiz_questions 
WHERE custom_category = 'Zastave' 
  AND remove_question = FALSE;

-- Primer pitanja sa Zastave kategorijom
SELECT id, question, custom_category, remove_question
FROM quiz_questions
WHERE custom_category = 'Zastave'
LIMIT 5;

