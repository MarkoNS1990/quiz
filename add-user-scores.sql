-- Tabela za čuvanje bodova korisnika
-- Ko više poena osvoji - bolji je igrač!

CREATE TABLE IF NOT EXISTS user_scores (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  total_points INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  three_point_answers INTEGER DEFAULT 0,
  two_point_answers INTEGER DEFAULT 0,
  one_point_answers INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(username)
);

-- Enable Row Level Security
ALTER TABLE user_scores ENABLE ROW LEVEL SECURITY;

-- Everyone can read scores (for leaderboard)
CREATE POLICY "User scores are viewable by everyone"
  ON user_scores FOR SELECT
  USING (true);

-- Anyone can insert their own score
CREATE POLICY "Anyone can insert scores"
  ON user_scores FOR INSERT
  WITH CHECK (true);

-- Anyone can update any score (since we match by username)
CREATE POLICY "Anyone can update scores"
  ON user_scores FOR UPDATE
  USING (true);

-- Function to update or insert user score
CREATE OR REPLACE FUNCTION upsert_user_score(
  p_username TEXT,
  p_points INTEGER
)
RETURNS void AS $$
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
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create index for faster leaderboard queries
CREATE INDEX IF NOT EXISTS idx_user_scores_total_points 
  ON user_scores(total_points DESC);

-- Insert some sample data (optional - you can delete this)
INSERT INTO user_scores (username, total_points, correct_answers, three_point_answers)
VALUES 
  ('Demo Player 1', 15, 5, 5),
  ('Demo Player 2', 10, 5, 2),
  ('Demo Player 3', 8, 4, 2)
ON CONFLICT (username) DO NOTHING;

