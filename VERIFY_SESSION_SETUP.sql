-- ============================================
-- VERIFY SESSION & AUTH SETUP
-- ============================================
-- This verifies your authentication is set up correctly
-- Sessions are stored automatically by Supabase Auth
-- NO BUCKET NEEDED - buckets are for files, not login data!

-- 1. Check if profiles table exists
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'profiles';

-- 2. Check profiles table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Check if RLS is enabled on profiles
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'profiles';

-- 4. Check existing policies on profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles';

-- ============================================
-- HOW SESSIONS WORK:
-- ============================================
-- 1. Supabase Auth automatically stores sessions in auth.sessions table
-- 2. Your app stores session tokens in device storage (Capacitor Preferences)
-- 3. When app reopens, it reads the token and restores the session
-- 4. NO BUCKET NEEDED - sessions are NOT files!
--
-- If login doesn't persist, the issue is:
-- - Session not being saved to device storage
-- - Session not being restored on app start
-- - Session expired (tokens expire after 1 hour by default)
-- ============================================
