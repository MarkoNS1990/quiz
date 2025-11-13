-- Remove the remove_question column from quiz_questions table
-- This column was used for flagging "stupid" questions for review

ALTER TABLE quiz_questions 
DROP COLUMN IF EXISTS remove_question;

-- Also drop the RLS policy if it exists
DROP POLICY IF EXISTS "Anyone can flag questions for removal" ON quiz_questions;

