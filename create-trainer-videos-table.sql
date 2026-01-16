-- CREATE TRAINER_VIDEOS TABLE AND SETUP
-- Run this in Supabase SQL Editor

-- 1. Create the trainer_videos table
CREATE TABLE IF NOT EXISTS public.trainer_videos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  target_muscle text,
  difficulty text,
  trainer_name text,
  is_featured boolean DEFAULT false,
  section text,
  duration integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Disable RLS completely
ALTER TABLE public.trainer_videos DISABLE ROW LEVEL SECURITY;

-- 3. Grant all permissions to all roles
GRANT ALL ON TABLE public.trainer_videos TO anon;
GRANT ALL ON TABLE public.trainer_videos TO authenticated;
GRANT ALL ON TABLE public.trainer_videos TO public;

-- 4. Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO public;

-- 5. Drop any existing policies (if they exist)
DROP POLICY IF EXISTS "Users can insert trainer_videos" ON public.trainer_videos;
DROP POLICY IF EXISTS "Users can view trainer_videos" ON public.trainer_videos;
DROP POLICY IF EXISTS "Users can update trainer_videos" ON public.trainer_videos;
DROP POLICY IF EXISTS "Users can delete trainer_videos" ON public.trainer_videos;

-- 6. Verify table exists and permissions
SELECT 
  table_name,
  privilege_type,
  grantee
FROM information_schema.role_table_grants 
WHERE table_name = 'trainer_videos'
AND table_schema = 'public';

-- 7. Test query (should work without errors)
SELECT COUNT(*) as total_videos FROM public.trainer_videos;

-- 8. Show table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'trainer_videos' 
AND table_schema = 'public'
ORDER BY ordinal_position;
