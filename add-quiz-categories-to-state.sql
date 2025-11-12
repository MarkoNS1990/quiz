-- Add selected_categories column to quiz_state table
-- This will store which categories are currently active in the quiz
ALTER TABLE quiz_state 
ADD COLUMN IF NOT EXISTS selected_categories TEXT[] DEFAULT NULL;

-- Note: TEXT[] is an array of text values
-- NULL means all categories are included (no filter)
-- Empty array [] means no categories selected (quiz won't start)
-- ['Category1', 'Category2'] means only those categories

