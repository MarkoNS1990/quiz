-- Postavi custom_category na 'Zastave' za sva pitanja koja imaju category='zastave'
UPDATE quiz_questions 
SET custom_category = 'Zastave' 
WHERE category = 'zastave';

-- Proveri rezultate
SELECT id, question, category, custom_category 
FROM quiz_questions 
WHERE category = 'zastave' 
ORDER BY id;

