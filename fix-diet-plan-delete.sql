-- ============================================
-- FIX DIET PLAN DELETE ISSUE
-- This script fixes RLS policies that prevent deletion
-- ============================================

-- Step 1: Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'diet_plans';

-- Step 2: Drop all existing policies on diet_plans
DROP POLICY IF EXISTS "Users can view their own diet plans" ON diet_plans;
DROP POLICY IF EXISTS "Users can insert their own diet plans" ON diet_plans;
DROP POLICY IF EXISTS "Users can update their own diet plans" ON diet_plans;
DROP POLICY IF EXISTS "Users can delete their own diet plans" ON diet_plans;

-- Step 3: Recreate policies with correct permissions
CREATE POLICY "Users can view their own diet plans"
  ON diet_plans
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own diet plans"
  ON diet_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diet plans"
  ON diet_plans
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diet plans"
  ON diet_plans
  FOR DELETE
  USING (auth.uid() = user_id);

-- Step 4: Ensure RLS is enabled
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;

-- Step 5: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON diet_plans TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 6: Verify the setup
SELECT 
  tablename,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'diet_plans'
ORDER BY cmd;
