-- Globalno stanje kviza - samo jedan red u tabeli
-- Svi korisnici dele isto stanje

CREATE TABLE IF NOT EXISTS quiz_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  is_active BOOLEAN DEFAULT FALSE,
  current_question_id BIGINT REFERENCES quiz_questions(id),
  current_answer TEXT,
  question_start_time TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert inicial row (samo jedan red ce postojati)
INSERT INTO quiz_state (id, is_active) 
VALUES (1, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE quiz_state ENABLE ROW LEVEL SECURITY;

-- Everyone can read the quiz state
CREATE POLICY "Quiz state is viewable by everyone"
  ON quiz_state FOR SELECT
  USING (true);

-- Anyone can update the quiz state (start/stop/answer)
CREATE POLICY "Anyone can update quiz state"
  ON quiz_state FOR UPDATE
  USING (true);

-- Enable realtime for quiz_state
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_state;

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_quiz_state_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quiz_state_updated_at
BEFORE UPDATE ON quiz_state
FOR EACH ROW
EXECUTE FUNCTION update_quiz_state_timestamp();

