-- ============================================
-- MEAL COMPLETIONS TABLE SETUP
-- Run this in your Supabase SQL Editor
-- ============================================

-- Drop existing table if you want to recreate it (CAUTION: This deletes all data!)
-- DROP TABLE IF EXISTS meal_completions CASCADE;

-- Create meal_completions table for tracking diet plan progress
CREATE TABLE IF NOT EXISTS meal_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  meal_name TEXT NOT NULL,
  food_name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein DECIMAL(10,2) NOT NULL,
  carbs DECIMAL(10,2) NOT NULL,
  fats DECIMAL(10,2) NOT NULL,
  completed BOOLEAN DEFAULT false,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, day, meal_name, completion_date)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_meal_completions_user_date 
ON meal_completions(user_id, completion_date);

CREATE INDEX IF NOT EXISTS idx_meal_completions_user_day 
ON meal_completions(user_id, day);

CREATE INDEX IF NOT EXISTS idx_meal_completions_completed 
ON meal_completions(user_id, completed, completion_date);

-- Enable Row Level Security (RLS)
ALTER TABLE meal_completions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own meal completions" ON meal_completions;
DROP POLICY IF EXISTS "Users can insert their own meal completions" ON meal_completions;
DROP POLICY IF EXISTS "Users can update their own meal completions" ON meal_completions;
DROP POLICY IF EXISTS "Users can delete their own meal completions" ON meal_completions;

-- Create RLS policies
CREATE POLICY "Users can view their own meal completions"
  ON meal_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal completions"
  ON meal_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal completions"
  ON meal_completions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal completions"
  ON meal_completions FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_meal_completions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_meal_completions_timestamp ON meal_completions;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_meal_completions_timestamp
  BEFORE UPDATE ON meal_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_meal_completions_updated_at();

-- Grant permissions to authenticated users
GRANT ALL ON meal_completions TO authenticated;
GRANT ALL ON meal_completions TO service_role;

-- Verify the table was created successfully
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'meal_completions'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies
WHERE tablename = 'meal_completions';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ meal_completions table setup complete!';
  RAISE NOTICE '✅ RLS policies enabled';
  RAISE NOTICE '✅ Indexes created';
  RAISE NOTICE '✅ Triggers configured';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 You can now track meal completions!';
END $$;
