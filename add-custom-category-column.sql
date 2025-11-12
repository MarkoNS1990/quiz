-- Add custom_category column to quiz_questions table
ALTER TABLE quiz_questions 
ADD COLUMN IF NOT EXISTS custom_category TEXT DEFAULT NULL;

-- Add index for faster filtering by custom_category
CREATE INDEX IF NOT EXISTS idx_quiz_questions_custom_category 
ON quiz_questions(custom_category) 
WHERE custom_category IS NOT NULL;

-- Update existing questions to have some sample categories (optional - remove if not needed)
-- UPDATE quiz_questions SET custom_category = 'Istorija' WHERE category = 'Istorija';
-- UPDATE quiz_questions SET custom_category = 'Geografija' WHERE category = 'Geografija';

