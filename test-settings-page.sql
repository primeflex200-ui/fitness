-- Test Settings Page - Verification Script
-- Run this in Supabase SQL Editor to verify everything is set up correctly

-- =====================================================
-- 1. CHECK IF PROFILES TABLE EXISTS
-- =====================================================
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles'
    ) 
    THEN '✅ Profiles table exists'
    ELSE '❌ Profiles table does NOT exist'
  END as table_status;

-- =====================================================
-- 2. CHECK ALL REQUIRED COLUMNS
-- =====================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- =====================================================
-- 3. CHECK RLS POLICIES
-- =====================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- =====================================================
-- 4. CHECK IF RLS IS ENABLED
-- =====================================================
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'profiles';

-- =====================================================
-- 5. COUNT PROFILES
-- =====================================================
SELECT 
  COUNT(*) as total_profiles,
  COUNT(full_name) as profiles_with_name,
  COUNT(email) as profiles_with_email,
  COUNT(age) as profiles_with_age,
  COUNT(gender) as profiles_with_gender,
  COUNT(height) as profiles_with_height,
  COUNT(weight) as profiles_with_weight,
  COUNT(fitness_goal) as profiles_with_fitness_goal,
  COUNT(diet_type) as profiles_with_diet_type
FROM profiles;

-- =====================================================
-- 6. CHECK FOR MISSING COLUMNS (Should return empty)
-- =====================================================
WITH required_columns AS (
  SELECT unnest(ARRAY[
    'id', 'email', 'full_name', 'age', 'gender', 
    'height', 'weight', 'fitness_goal', 'diet_type',
    'phone_number', 'water_reminder_enabled', 
    'water_reminder_interval', 'last_reminder_sent', 'created_at'
  ]) AS column_name
),
existing_columns AS (
  SELECT column_name 
  FROM information_schema.columns 
  WHERE table_schema = 'public' 
    AND table_name = 'profiles'
)
SELECT 
  rc.column_name as missing_column
FROM required_columns rc
LEFT JOIN existing_columns ec ON rc.column_name = ec.column_name
WHERE ec.column_name IS NULL;

-- =====================================================
-- 7. CHECK TRIGGER FOR AUTO-CREATING PROFILES
-- =====================================================
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND trigger_schema = 'auth';

-- =====================================================
-- 8. SAMPLE PROFILE DATA (for testing)
-- =====================================================
SELECT 
  id,
  email,
  full_name,
  age,
  gender,
  height,
  weight,
  fitness_goal,
  diet_type,
  created_at
FROM profiles
LIMIT 5;

-- =====================================================
-- SUMMARY
-- =====================================================
SELECT 
  '✅ Run complete! Check results above.' as status,
  'If any required columns are missing, run fix-profiles-table.sql' as next_step;
