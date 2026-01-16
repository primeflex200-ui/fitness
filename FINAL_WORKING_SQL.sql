-- ============================================
-- FINAL WORKING SQL - RUN THIS IN SUPABASE
-- ============================================

-- 1. Drop table if exists (start fresh)
DROP TABLE IF EXISTS meal_completions CASCADE;

-- 2. Create table
CREATE TABLE meal_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  meal_name TEXT NOT NULL,
  food_name TEXT NOT NULL,
  calories INTEGER NOT NULL DEFAULT 0,
  protein DECIMAL(10,2) NOT NULL DEFAULT 0,
  carbs DECIMAL(10,2) NOT NULL DEFAULT 0,
  fats DECIMAL(10,2) NOT NULL DEFAULT 0,
  completed BOOLEAN DEFAULT true,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, day, meal_name, completion_date)
);

-- 3. Create indexes
CREATE INDEX idx_meal_user_date ON meal_completions(user_id, completion_date);
CREATE INDEX idx_meal_user_day ON meal_completions(user_id, day);

-- 4. Enable RLS
ALTER TABLE meal_completions ENABLE ROW LEVEL SECURITY;

-- 5. Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view their own meal completions" ON meal_completions;
DROP POLICY IF EXISTS "Users can insert their own meal completions" ON meal_completions;
DROP POLICY IF EXISTS "Users can update their own meal completions" ON meal_completions;
DROP POLICY IF EXISTS "Users can delete their own meal completions" ON meal_completions;

-- 6. Create NEW policies
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

-- 7. Grant permissions
GRANT ALL ON meal_completions TO authenticated;
GRANT ALL ON meal_completions TO service_role;

-- 8. Test it works
SELECT 'Table created successfully!' as status;

-- 9. Check if you can insert (replace YOUR_USER_ID with your actual user ID)
-- Get your user ID first:
SELECT auth.uid() as your_user_id;

-- Then test insert (this will work after you're logged in):
-- INSERT INTO meal_completions (user_id, day, meal_name, food_name, calories, protein, carbs, fats)
-- VALUES (auth.uid(), 'Tuesday', 'Test-0', 'Test Meal', 100, 10, 10, 5);

-- Check if it worked:
-- SELECT * FROM meal_completions WHERE user_id = auth.uid();
