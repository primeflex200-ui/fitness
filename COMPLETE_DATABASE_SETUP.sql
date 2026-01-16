import Lightning from './Lightning';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Lightning
    hue={220}
    xOffset={0}
    speed={1}
    intensity={1}
    size={1}
  />
</div>-- =====================================================
-- COMPLETE DATABASE SETUP FOR FLEX ZEN COACH
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. STRENGTH PROGRESS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS strength_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  exercise TEXT,
  weight NUMERIC,
  reps INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE strength_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own strength progress" ON strength_progress;
DROP POLICY IF EXISTS "Users can insert own strength progress" ON strength_progress;
DROP POLICY IF EXISTS "Users can update own strength progress" ON strength_progress;
DROP POLICY IF EXISTS "Users can delete own strength progress" ON strength_progress;

-- Create RLS policies
CREATE POLICY "Users can view own strength progress"
  ON strength_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own strength progress"
  ON strength_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own strength progress"
  ON strength_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own strength progress"
  ON strength_progress FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 2. PROGRESS TRACKING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS progress_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed_exercises TEXT[] DEFAULT '{}',
  total_exercises INTEGER DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0,
  weekly_stats JSONB DEFAULT '{}',
  monthly_trend JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_progress_tracking_user_date 
ON progress_tracking(user_id, date DESC);

-- Enable RLS
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own progress" ON progress_tracking;
DROP POLICY IF EXISTS "Users can insert their own progress" ON progress_tracking;
DROP POLICY IF EXISTS "Users can update their own progress" ON progress_tracking;
DROP POLICY IF EXISTS "Users can delete their own progress" ON progress_tracking;

-- Create RLS policies
CREATE POLICY "Users can view their own progress"
  ON progress_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON progress_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON progress_tracking FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
  ON progress_tracking FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 3. USER STATS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  workouts_completed INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  steps_today INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;

-- Create RLS policies
CREATE POLICY "Users can view own stats"
  ON user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
  ON user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- 4. WORKOUT COMPLETIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS workout_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
  exercise_name TEXT,
  workout_type TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, workout_date, exercise_name)
);

-- Enable RLS
ALTER TABLE workout_completions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own completions" ON workout_completions;
DROP POLICY IF EXISTS "Users can insert own completions" ON workout_completions;
DROP POLICY IF EXISTS "Users can update own completions" ON workout_completions;
DROP POLICY IF EXISTS "Users can delete own completions" ON workout_completions;

-- Create RLS policies
CREATE POLICY "Users can view own completions"
  ON workout_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON workout_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own completions"
  ON workout_completions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own completions"
  ON workout_completions FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 5. PROFILES TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  age INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create RLS policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- 6. FEEDBACK TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can insert feedback" ON feedback;
DROP POLICY IF EXISTS "Users can view own feedback" ON feedback;

-- Create RLS policies
CREATE POLICY "Anyone can insert feedback"
  ON feedback FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify tables were created:

SELECT 'strength_progress' as table_name, COUNT(*) as row_count FROM strength_progress
UNION ALL
SELECT 'progress_tracking', COUNT(*) FROM progress_tracking
UNION ALL
SELECT 'user_stats', COUNT(*) FROM user_stats
UNION ALL
SELECT 'workout_completions', COUNT(*) FROM workout_completions
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'feedback', COUNT(*) FROM feedback;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'All tables created successfully!' as status;
