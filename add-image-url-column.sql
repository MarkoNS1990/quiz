-- Add image_url column to quiz_questions table
-- This allows questions to include images (e.g. country flags, logos, etc.)

ALTER TABLE quiz_questions
ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN quiz_questions.image_url IS 'URL to an image for visual questions (e.g. flags, logos, landmarks)';

-- Verify the change
-- SELECT * FROM quiz_questions LIMIT 1;

