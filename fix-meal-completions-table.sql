-- Ensure meal_completions table exists with correct structure
CREATE TABLE IF NOT EXISTS meal_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  meal_name TEXT NOT NULL,
  food_name TEXT NOT NULL,
  calories INTEGER NOT NULL DEFAULT 0,
  protein INTEGER NOT NULL DEFAULT 0,
  carbs INTEGER NOT NULL DEFAULT 0,
  fats INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, day, meal_name, completion_date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_meal_completions_user_id ON meal_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_completions_date ON meal_completions(completion_date);
CREATE INDEX IF NOT EXISTS idx_meal_completions_user_date ON meal_completions(user_id, completion_date);

-- Enable RLS
ALTER TABLE meal_completions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own meal completions" ON meal_completions;
DROP POLICY IF EXISTS "Users can insert their own meal completions" ON meal_completions;
DROP POLICY IF EXISTS "Users can update their own meal completions" ON meal_completions;
DROP POLICY IF EXISTS "Users can delete their own meal completions" ON meal_completions;

-- Create RLS policies
CREATE POLICY "Users can view their own meal completions"
  ON meal_completions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal completions"
  ON meal_completions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal completions"
  ON meal_completions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal completions"
  ON meal_completions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON meal_completions TO authenticated;
GRANT ALL ON meal_completions TO service_role;
