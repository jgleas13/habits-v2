-- Create enum for frequency
CREATE TYPE habit_frequency AS ENUM ('daily', 'weekly', 'monthly');

-- Create enum for days of week
CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- Add new columns to habits table
ALTER TABLE habits 
  ADD COLUMN IF NOT EXISTS frequency habit_frequency DEFAULT 'daily',
  ADD COLUMN IF NOT EXISTS repeat_days day_of_week[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']::day_of_week[],
  ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS time_of_day TIME DEFAULT '08:00:00',
  ADD COLUMN IF NOT EXISTS goal INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Create habit_completions table
CREATE TABLE IF NOT EXISTS habit_completions (
  id BIGSERIAL PRIMARY KEY,
  habit_id BIGINT REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL,
  status habit_status DEFAULT 'unknown',
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  UNIQUE(habit_id, completion_date)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS habit_completions_habit_id_idx ON habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS habit_completions_user_id_idx ON habit_completions(user_id);
CREATE INDEX IF NOT EXISTS habit_completions_date_idx ON habit_completions(completion_date);
CREATE INDEX IF NOT EXISTS habit_completions_status_idx ON habit_completions(status);

-- Add RLS policies for habit_completions
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own habit completions" ON habit_completions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own habit completions" ON habit_completions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own habit completions" ON habit_completions
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Update habits table to remove done column (replaced by completions table)
ALTER TABLE habits DROP COLUMN IF EXISTS done; 