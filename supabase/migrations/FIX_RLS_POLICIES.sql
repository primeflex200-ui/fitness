-- ============================================
-- FIX ROW LEVEL SECURITY (RLS) POLICIES
-- Run this in Supabase SQL Editor to fix RLS errors
-- ============================================

-- IMPORTANT: This disables RLS for testing/development
-- For production, use proper RLS policies

-- 1. Disable RLS on trainer_videos table
ALTER TABLE public.trainer_videos DISABLE ROW LEVEL SECURITY;

-- 2. Disable RLS on feedback table
ALTER TABLE public.feedback DISABLE ROW LEVEL SECURITY;

-- 3. Disable RLS on community_messages table
ALTER TABLE public.community_messages DISABLE ROW LEVEL SECURITY;

-- 4. Make sure grants are set (allow public access)
GRANT ALL ON TABLE public.trainer_videos TO anon, authenticated;
GRANT ALL ON TABLE public.feedback TO anon, authenticated;
GRANT ALL ON TABLE public.community_messages TO anon, authenticated;

-- 5. Verify RLS is disabled
SELECT table_name, rowsecurity 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('trainer_videos', 'feedback', 'community_messages')
ORDER BY table_name;

-- Expected output: All should show "f" (false) in rowsecurity column

-- ============================================
-- After running this, try uploading a video again!
-- If it still fails, check:
-- 1. The trainer_videos table exists (run first SQL migration)
-- 2. Supabase Storage bucket exists
-- ============================================
