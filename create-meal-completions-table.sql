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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_meal_completions_user_date 
ON meal_completions(user_id, completion_date);

CREATE INDEX IF NOT EXISTS idx_meal_completions_user_day 
ON meal_completions(user_id, day);

-- Enable RLS
ALTER TABLE meal_completions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own meal completions"
  ON meal_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal completions"
  ON meal_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal completions"
  ON meal_completions FOR UPDATE
  USING (auth.uid() = user_id);

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

-- Create trigger
CREATE TRIGGER update_meal_completions_timestamp
  BEFORE UPDATE ON meal_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_meal_completions_updated_at();

-- Grant permissions
GRANT ALL ON meal_completions TO authenticated;
GRANT ALL ON meal_completions TO service_role;
