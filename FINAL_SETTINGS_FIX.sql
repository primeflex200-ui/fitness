-- =====================================================
-- FINAL SETTINGS FIX - UPSERT METHOD
-- This will make Settings work perfectly
-- =====================================================

-- Step 1: Add updated_at column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Step 2: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- Step 3: Ensure your user has a profile row
-- Replace YOUR_USER_ID with your actual user ID from auth.users
DO $$
DECLARE
  current_user_id UUID;
  current_user_email TEXT;
BEGIN
  -- Get your user info
  SELECT id, email INTO current_user_id, current_user_email 
  FROM auth.users 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  IF current_user_id IS NOT NULL THEN
    -- Insert or update profile
    INSERT INTO profiles (
      id, 
      email, 
      full_name,
      created_at,
      updated_at
    ) VALUES (
      current_user_id,
      current_user_email,
      current_user_email,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      updated_at = NOW();
    
    RAISE NOTICE '✅ Profile created/updated for user: % (%)', current_user_email, current_user_id;
  END IF;
END $$;

-- Step 4: Drop and recreate RLS policies with UPSERT support
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- Allow SELECT
CREATE POLICY "profiles_select_policy"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow INSERT (for UPSERT)
CREATE POLICY "profiles_insert_policy"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow UPDATE (for UPSERT)
CREATE POLICY "profiles_update_policy"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Step 5: Test UPSERT
DO $$
DECLARE
  test_user_id UUID;
  test_email TEXT;
BEGIN
  SELECT id, email INTO test_user_id, test_email FROM auth.users LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Test UPSERT
    INSERT INTO profiles (
      id,
      email,
      full_name,
      age,
      gender,
      height,
      weight,
      fitness_goal,
      diet_type,
      updated_at
    ) VALUES (
      test_user_id,
      test_email,
      'Test User',
      25,
      'male',
      175,
      70,
      'muscle_gain',
      'non_veg',
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      age = EXCLUDED.age,
      gender = EXCLUDED.gender,
      height = EXCLUDED.height,
      weight = EXCLUDED.weight,
      fitness_goal = EXCLUDED.fitness_goal,
      diet_type = EXCLUDED.diet_type,
      updated_at = NOW();
    
    RAISE NOTICE '✅ UPSERT test successful for user: %', test_user_id;
  END IF;
END $$;

-- Step 6: Verify everything
SELECT 
  '✅ Setup complete!' as status,
  id,
  email,
  full_name,
  age,
  gender,
  height,
  weight,
  fitness_goal,
  diet_type,
  created_at,
  updated_at
FROM profiles
ORDER BY updated_at DESC;

-- Step 7: Show RLS policies
SELECT 
  '📋 RLS Policies:' as info,
  policyname,
  cmd,
  qual::text as using_clause
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd;

SELECT '🎉 Done! Now test your Settings page.' as final_message;
