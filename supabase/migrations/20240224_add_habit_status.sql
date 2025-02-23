-- Create an enum type for habit status
CREATE TYPE habit_status AS ENUM ('unknown', 'success', 'failed', 'skipped');

-- Add status column to habits table with default value 'unknown'
ALTER TABLE habits ADD COLUMN IF NOT EXISTS status habit_status DEFAULT 'unknown';

-- Add completed_at timestamp column
ALTER TABLE habits ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Drop the done column as it's being replaced by status
ALTER TABLE habits DROP COLUMN IF EXISTS done;

-- Add an index on status for faster querying
CREATE INDEX IF NOT EXISTS habits_status_idx ON habits(status);

-- Add an index on completed_at for faster querying
CREATE INDEX IF NOT EXISTS habits_completed_at_idx ON habits(completed_at); 