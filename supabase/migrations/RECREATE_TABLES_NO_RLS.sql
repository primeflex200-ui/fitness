-- ============================================
-- RECREATE TABLES WITHOUT RLS
-- This removes any existing RLS policies that might be auto-created
-- Run this in Supabase SQL Editor
-- ============================================

-- Make sure extension exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop old tables (backup your data first!)
DROP TABLE IF EXISTS public.trainer_videos CASCADE;
DROP TABLE IF EXISTS public.feedback CASCADE;
DROP TABLE IF EXISTS public.community_messages CASCADE;

-- ====== TRAINER_VIDEOS TABLE ======
CREATE TABLE public.trainer_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  target_muscle TEXT,
  difficulty TEXT,
  trainer_name TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  section TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID
);

-- Ensure RLS is OFF
ALTER TABLE public.trainer_videos DISABLE ROW LEVEL SECURITY;

-- Grant full public access
GRANT ALL ON TABLE public.trainer_videos TO anon, authenticated, public;
GRANT ALL ON TABLE public.trainer_videos TO postgres;

-- ====== FEEDBACK TABLE ======
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.feedback DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.feedback TO anon, authenticated, public;
GRANT ALL ON TABLE public.feedback TO postgres;

-- ====== COMMUNITY_MESSAGES TABLE ======
CREATE TABLE public.community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.community_messages DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.community_messages TO anon, authenticated, public;
GRANT ALL ON TABLE public.community_messages TO postgres;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, public;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Verify tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('trainer_videos', 'feedback', 'community_messages')
ORDER BY table_name;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('trainer_videos', 'feedback', 'community_messages');

-- Expected output: All should show 'f' (false)
