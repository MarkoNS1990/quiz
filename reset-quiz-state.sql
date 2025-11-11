-- Reset quiz state if it gets stuck
-- Run this in Supabase SQL Editor if quiz won't start

UPDATE quiz_state 
SET 
  is_active = false,
  current_question_id = null,
  current_answer = null,
  question_start_time = null,
  updated_at = NOW()
WHERE id = 1;

-- Verify the reset
SELECT * FROM quiz_state WHERE id = 1;

