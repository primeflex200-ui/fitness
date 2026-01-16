-- ============================================
-- IMMEDIATE FIX - Run this FIRST
-- ============================================

-- Step 1: Make sure tables exist
create extension if not exists pgcrypto;

-- trainer_videos
drop table if exists public.trainer_videos cascade;
create table public.trainer_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  video_url text not null,
  thumbnail_url text,
  target_muscle text,
  difficulty text,
  trainer_name text,
  is_featured boolean default false,
  section text,
  created_at timestamp with time zone default now(),
  created_by uuid
);

-- feedback
drop table if exists public.feedback cascade;
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  message text not null,
  created_at timestamp with time zone default now()
);

-- community_messages
drop table if exists public.community_messages cascade;
create table public.community_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  message text not null,
  created_at timestamp with time zone default now()
);

-- Step 2: DISABLE ROW LEVEL SECURITY on all tables
ALTER TABLE public.trainer_videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages DISABLE ROW LEVEL SECURITY;

-- Step 3: GRANT permissions to public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.trainer_videos TO anon, authenticated, public;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.feedback TO anon, authenticated, public;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.community_messages TO anon, authenticated, public;

-- Step 4: GRANT permissions on sequences (for auto-increment)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, public;

-- Step 5: Verify - all should show 'f' (false)
SELECT 
  schemaname,
  tablename,
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('trainer_videos', 'feedback', 'community_messages')
ORDER BY tablename;
