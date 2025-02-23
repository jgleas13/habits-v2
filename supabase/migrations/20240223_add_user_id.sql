-- Add user_id column to habits table
ALTER TABLE habits ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create a policy to ensure users can only see their own habits
CREATE POLICY "Users can only view their own habits" ON habits
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create a policy to ensure users can only insert their own habits
CREATE POLICY "Users can only insert their own habits" ON habits
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create a policy to ensure users can only update their own habits
CREATE POLICY "Users can only update their own habits" ON habits
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Enable Row Level Security
ALTER TABLE habits ENABLE ROW LEVEL SECURITY; 