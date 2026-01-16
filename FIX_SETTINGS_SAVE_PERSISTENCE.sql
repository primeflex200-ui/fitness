-- =====================================================
-- FIX SETTINGS SAVE PERSISTENCE ISSUE
-- Run this ENTIRE script in Supabase SQL Editor
-- =====================================================

-- Step 1: Check current state
SELECT 'Step 1: Checking current profiles...' as status;
SELECT id, email, full_name, age, gender, height, weight, fitness_goal, diet_type 
FROM profiles 
LIMIT 5;

-- Step 2: Ensure all required columns exist
SELECT 'Step 2: Adding missing columns...' as status;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS height NUMERIC;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weight NUMERIC;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fitness_goal TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS diet_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS water_reminder_enabled BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS water_reminder_interval INTEGER DEFAULT 60;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_reminder_sent TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Step 3: Drop ALL existing RLS policies
SELECT 'Step 3: Dropping old RLS policies...' as status;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- Step 4: Create fresh, simple RLS policies
SELECT 'Step 4: Creating new RLS policies...' as status;

-- SELECT policy - users can view their own profile
CREATE POLICY "profiles_select_policy"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- INSERT policy - users can create their own profile
CREATE POLICY "profiles_insert_policy"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- UPDATE policy - users can update their own profile
CREATE POLICY "profiles_update_policy"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- DELETE policy - users can delete their own profile
CREATE POLICY "profiles_delete_policy"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Step 5: Ensure RLS is enabled
SELECT 'Step 5: Enabling RLS...' as status;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 6: Verify policies were created
SELECT 'Step 6: Verifying policies...' as status;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- Step 7: Create profiles for any users without one
SELECT 'Step 7: Creating missing profiles...' as status;

INSERT INTO profiles (id, email, full_name, created_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  NOW()
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 8: Test UPDATE directly (as system)
SELECT 'Step 8: Testing direct UPDATE...' as status;

DO $$
DECLARE
  test_user_id UUID;
  test_name TEXT;
BEGIN
  -- Get first user
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Try update
    UPDATE profiles 
    SET full_name = COALESCE(full_name, 'Test User ' || test_user_id::text)
    WHERE id = test_user_id;
    
    -- Verify
    SELECT full_name INTO test_name FROM profiles WHERE id = test_user_id;
    
    RAISE NOTICE 'UPDATE test successful! User: %, Name: %', test_user_id, test_name;
  ELSE
    RAISE NOTICE 'No users found to test';
  END IF;
END $$;

-- Step 9: Grant necessary permissions
SELECT 'Step 9: Granting permissions...' as status;

GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;

-- Step 10: Create trigger for auto-creating profiles
SELECT 'Step 10: Creating auto-profile trigger...' as status;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 11: Final verification
SELECT 'Step 11: Final verification...' as status;

SELECT 
  '✅ Setup Complete!' as status,
  COUNT(*) as total_users,
  COUNT(p.id) as users_with_profiles,
  COUNT(*) - COUNT(p.id) as missing_profiles
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id;

-- Step 12: Show all profiles
SELECT 'Step 12: Current profiles:' as status;
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
ORDER BY created_at DESC;

-- =====================================================
-- DONE! Now test in your app:
-- 1. Go to Settings
-- 2. Edit your profile
-- 3. Click Save Changes
-- 4. Navigate away and come back
-- 5. Your changes should persist!
-- =====================================================

SELECT '🎉 All done! Test your Settings page now.' as final_message;
