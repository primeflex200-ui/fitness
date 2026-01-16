-- COMPLETE RLS FIX FOR TRAINER_VIDEOS TABLE
-- Run this in Supabase SQL Editor

-- 1. Disable RLS completely
ALTER TABLE public.trainer_videos DISABLE ROW LEVEL SECURITY;

-- 2. Grant all permissions to all roles
GRANT ALL ON TABLE public.trainer_videos TO anon;
GRANT ALL ON TABLE public.trainer_videos TO authenticated;
GRANT ALL ON TABLE public.trainer_videos TO public;

-- 3. Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO public;

-- 4. Drop any existing policies (if they exist)
DROP POLICY IF EXISTS "Users can insert trainer_videos" ON public.trainer_videos;
DROP POLICY IF EXISTS "Users can view trainer_videos" ON public.trainer_videos;
DROP POLICY IF EXISTS "Users can update trainer_videos" ON public.trainer_videos;
DROP POLICY IF EXISTS "Users can delete trainer_videos" ON public.trainer_videos;

-- 5. Verify permissions
SELECT 
  table_name,
  privilege_type,
  grantee
FROM information_schema.role_table_grants 
WHERE table_name = 'trainer_videos'
AND table_schema = 'public';

-- 6. Test query (should work without errors)
SELECT COUNT(*) as total_videos FROM public.trainer_videos;
