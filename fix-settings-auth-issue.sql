-- Fix Settings Authentication Issue
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. CHECK CURRENT USERS AND PROFILES
-- =====================================================
SELECT 
  au.id as user_id,
  au.email,
  au.created_at as user_created,
  p.id as profile_id,
  p.full_name,
  p.email as profile_email
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC
LIMIT 10;

-- =====================================================
-- 2. CREATE MISSING PROFILES
-- =====================================================
-- This will create profiles for any users that don't have one
INSERT INTO public.profiles (id, email, full_name, created_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. VERIFY RLS POLICIES
-- =====================================================
-- Check existing policies
SELECT 
  policyname,
  cmd,
  qual::text as using_expression,
  with_check::text as with_check_expression
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd;

-- =====================================================
-- 4. DROP AND RECREATE RLS POLICIES (if needed)
-- =====================================================
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

-- Create fresh policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- 5. ENSURE RLS IS ENABLED
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. TEST UPDATE PERMISSION
-- =====================================================
-- This will show if you can update your own profile
-- Replace 'YOUR_USER_ID' with your actual user ID
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Get the first user ID for testing
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  -- Try to update (this will fail if RLS is blocking)
  UPDATE profiles 
  SET full_name = COALESCE(full_name, 'Test User')
  WHERE id = test_user_id;
  
  RAISE NOTICE 'Update test successful for user: %', test_user_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Update test failed: %', SQLERRM;
END $$;

-- =====================================================
-- 7. CHECK TRIGGER FOR AUTO-CREATING PROFILES
-- =====================================================
-- Verify the trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND trigger_schema = 'auth';

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 8. FINAL VERIFICATION
-- =====================================================
SELECT 
  'Setup complete!' as status,
  COUNT(*) as total_users,
  COUNT(p.id) as users_with_profiles,
  COUNT(*) - COUNT(p.id) as users_without_profiles
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id;

-- =====================================================
-- 9. TEST QUERY (Run this as your authenticated user)
-- =====================================================
-- This simulates what the app does
-- You can test this in Supabase SQL Editor while logged in
SELECT 
  'If you see this, SELECT policy works!' as test_result,
  *
FROM profiles
WHERE id = auth.uid();

-- Try an update
UPDATE profiles
SET full_name = full_name
WHERE id = auth.uid()
RETURNING 'If you see this, UPDATE policy works!' as test_result, *;
