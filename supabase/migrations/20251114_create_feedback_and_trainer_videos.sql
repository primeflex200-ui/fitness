-- Migration: create feedback, trainer_videos, community_messages
-- Date: 2025-11-14

-- Make sure pgcrypto is available for gen_random_uuid()
create extension if not exists pgcrypto;

-- Feedback table
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  message text null,
  created_at timestamptz default now()
);

-- Trainer videos table
create table if not exists public.trainer_videos (
  id uuid primary key default gen_random_uuid(),
  title text null,
  description text null,
  video_url text null,
  thumbnail_url text null,
  target_muscle text null,
  difficulty text null,
  trainer_name text null,
  is_featured boolean default false,
  section text null,
  created_at timestamptz default now()
);

-- Community messages
create table if not exists public.community_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  message text null,
  created_at timestamptz default now()
);

-- Optional: enable RLS and basic policies for authenticated use (recommended for dev/test)
-- Uncomment the following blocks if you want to enable RLS and create policies.

-- alter table public.feedback enable row level security;
-- create policy "Feedback: allow select to everyone" on public.feedback for select using (true);
-- create policy "Feedback: authenticated insert" on public.feedback for insert with check (auth.uid() IS NOT NULL);

-- alter table public.trainer_videos enable row level security;
-- create policy "TrainerVideos: allow select to everyone" on public.trainer_videos for select using (true);
-- create policy "TrainerVideos: authenticated insert" on public.trainer_videos for insert with check (auth.uid() IS NOT NULL);

-- alter table public.community_messages enable row level security;
-- create policy "CommunityMessages: allow select to everyone" on public.community_messages for select using (true);
-- create policy "CommunityMessages: authenticated insert" on public.community_messages for insert with check (auth.uid() IS NOT NULL);

-- If you do not use RLS, you can grant simple privileges to the anon role for quick testing:
-- grant select, insert on table public.feedback to anon;
-- grant select, insert on table public.trainer_videos to anon;
-- grant select, insert on table public.community_messages to anon;

-- End of migration
