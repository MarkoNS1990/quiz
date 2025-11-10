-- Update upsert_user_score function to RETURN the new total_points
-- This way we don't need a separate query to get the total score

DROP FUNCTION IF EXISTS upsert_user_score(TEXT, INTEGER);

CREATE OR REPLACE FUNCTION upsert_user_score(
  p_username TEXT,
  p_points INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_new_total INTEGER;
BEGIN
  INSERT INTO user_scores (username, total_points, correct_answers, 
    three_point_answers, two_point_answers, one_point_answers, last_updated)
  VALUES (
    p_username, 
    p_points, 
    1,
    CASE WHEN p_points = 3 THEN 1 ELSE 0 END,
    CASE WHEN p_points = 2 THEN 1 ELSE 0 END,
    CASE WHEN p_points = 1 THEN 1 ELSE 0 END,
    NOW()
  )
  ON CONFLICT (username) 
  DO UPDATE SET
    total_points = user_scores.total_points + p_points,
    correct_answers = user_scores.correct_answers + 1,
    three_point_answers = user_scores.three_point_answers + 
      CASE WHEN p_points = 3 THEN 1 ELSE 0 END,
    two_point_answers = user_scores.two_point_answers + 
      CASE WHEN p_points = 2 THEN 1 ELSE 0 END,
    one_point_answers = user_scores.one_point_answers + 
      CASE WHEN p_points = 1 THEN 1 ELSE 0 END,
    last_updated = NOW()
  RETURNING total_points INTO v_new_total;
  
  -- If it was an INSERT (not UPDATE), get the inserted value
  IF v_new_total IS NULL THEN
    SELECT total_points INTO v_new_total
    FROM user_scores
    WHERE username = p_username;
  END IF;
  
  RETURN v_new_total;
END;
$$ LANGUAGE plpgsql;

