-- ============================================
-- REMOVE ALL TRIGGERS AND POLICIES
-- This will completely disable RLS protections
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Disable RLS completely
ALTER TABLE public.trainer_videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies (if any exist)
DROP POLICY IF EXISTS "trainer_videos_policy" ON public.trainer_videos;
DROP POLICY IF EXISTS "feedback_policy" ON public.feedback;
DROP POLICY IF EXISTS "community_messages_policy" ON public.community_messages;

-- Step 3: Drop ALL triggers (if any exist that might be blocking)
DROP TRIGGER IF EXISTS "trainer_videos_insert_trigger" ON public.trainer_videos CASCADE;
DROP TRIGGER IF EXISTS "feedback_insert_trigger" ON public.feedback CASCADE;
DROP TRIGGER IF EXISTS "community_messages_insert_trigger" ON public.community_messages CASCADE;

-- Step 4: Grant FULL permissions
GRANT ALL PRIVILEGES ON TABLE public.trainer_videos TO anon, authenticated, public;
GRANT ALL PRIVILEGES ON TABLE public.feedback TO anon, authenticated, public;
GRANT ALL PRIVILEGES ON TABLE public.community_messages TO anon, authenticated, public;

-- Step 5: Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, public;

-- Step 6: List all remaining triggers and policies
SELECT * FROM pg_trigger WHERE tgrelid = 'public.trainer_videos'::regclass;
SELECT * FROM pg_policies WHERE tablename = 'trainer_videos';

-- If the above returns anything, the issue might be deeper
-- Try this to see table constraints:
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'trainer_videos';
