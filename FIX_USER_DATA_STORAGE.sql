-- FIX USER DATA STORAGE ISSUES
-- Run this in Supabase SQL Editor

-- =====================================================
-- STEP 1: CREATE MISSING TABLES
-- =====================================================

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  age INTEGER,
  weight NUMERIC,
  height NUMERIC,
  gender TEXT,
  fitness_goal TEXT,
  activity_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout_completions table if it doesn't exist
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

-- Create progress_tracking table if it doesn't exist
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

-- Create meal_completions table if it doesn't exist
CREATE TABLE IF NOT EXISTS meal_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, meal_date, meal_type)
);

-- Create diet_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT,
  plan_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 2: FIX PROFILES TABLE RLS POLICIES
-- =====================================================

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new policies
CREATE POLICY "profiles_select_policy"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_policy"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- STEP 3: CREATE AUTO-PROFILE FUNCTION & TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;
CREATE TRIGGER create_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_profile_for_user();

-- =====================================================
-- STEP 4: CREATE PROFILES FOR EXISTING USERS
-- =====================================================

INSERT INTO public.profiles (id, email, created_at, updated_at)
SELECT 
  id,
  email,
  created_at,
  NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 5: FIX OTHER TABLES RLS POLICIES
-- =====================================================

-- Fix workout_completions
ALTER TABLE workout_completions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "workout_completions_insert_policy" ON workout_completions;
DROP POLICY IF EXISTS "Users can insert own completions" ON workout_completions;
CREATE POLICY "workout_completions_insert_policy"
  ON workout_completions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "workout_completions_select_policy" ON workout_completions;
DROP POLICY IF EXISTS "Users can view own completions" ON workout_completions;
CREATE POLICY "workout_completions_select_policy"
  ON workout_completions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "workout_completions_update_policy" ON workout_completions;
DROP POLICY IF EXISTS "Users can update own completions" ON workout_completions;
CREATE POLICY "workout_completions_update_policy"
  ON workout_completions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Fix progress_tracking
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "progress_tracking_insert_policy" ON progress_tracking;
DROP POLICY IF EXISTS "Users can insert their own progress" ON progress_tracking;
CREATE POLICY "progress_tracking_insert_policy"
  ON progress_tracking FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "progress_tracking_select_policy" ON progress_tracking;
DROP POLICY IF EXISTS "Users can view their own progress" ON progress_tracking;
CREATE POLICY "progress_tracking_select_policy"
  ON progress_tracking FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "progress_tracking_update_policy" ON progress_tracking;
DROP POLICY IF EXISTS "Users can update their own progress" ON progress_tracking;
CREATE POLICY "progress_tracking_update_policy"
  ON progress_tracking FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Fix meal_completions
ALTER TABLE meal_completions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "meal_completions_insert_policy" ON meal_completions;
CREATE POLICY "meal_completions_insert_policy"
  ON meal_completions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "meal_completions_select_policy" ON meal_completions;
CREATE POLICY "meal_completions_select_policy"
  ON meal_completions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "meal_completions_update_policy" ON meal_completions;
CREATE POLICY "meal_completions_update_policy"
  ON meal_completions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Fix diet_plans
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "diet_plans_insert_policy" ON diet_plans;
CREATE POLICY "diet_plans_insert_policy"
  ON diet_plans FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "diet_plans_select_policy" ON diet_plans;
CREATE POLICY "diet_plans_select_policy"
  ON diet_plans FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "diet_plans_update_policy" ON diet_plans;
CREATE POLICY "diet_plans_update_policy"
  ON diet_plans FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "diet_plans_delete_policy" ON diet_plans;
CREATE POLICY "diet_plans_delete_policy"
  ON diet_plans FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'User data storage fixed! All tables created and RLS policies updated.' AS status;
