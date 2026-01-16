-- ============================================
-- SUPABASE SQL MIGRATION
-- Create feedback, trainer_videos, community_messages tables
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Ensure pgcrypto extension exists (for UUID generation)
create extension if not exists pgcrypto;

-- Step 2: Create feedback table
drop table if exists public.feedback cascade;
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  message text,
  created_at timestamp with time zone default now()
);

-- Step 3: Create trainer_videos table
drop table if exists public.trainer_videos cascade;
create table public.trainer_videos (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  video_url text,
  thumbnail_url text,
  target_muscle text,
  difficulty text,
  trainer_name text,
  is_featured boolean default false,
  section text,
  created_at timestamp with time zone default now()
);

-- Step 4: Create community_messages table
drop table if exists public.community_messages cascade;
create table public.community_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  message text,
  created_at timestamp with time zone default now()
);

-- Step 5: Allow public (anon) access for testing
-- (For production, use RLS policies instead)
grant select, insert on table public.feedback to anon;
grant select, insert on table public.trainer_videos to anon;
grant select, insert on table public.community_messages to anon;

-- Step 6: Verify tables were created
select table_name 
from information_schema.tables 
where table_schema = 'public' 
  and table_name in ('feedback', 'trainer_videos', 'community_messages')
order by table_name;

-- Expected output: 3 rows (community_messages, feedback, trainer_videos)
