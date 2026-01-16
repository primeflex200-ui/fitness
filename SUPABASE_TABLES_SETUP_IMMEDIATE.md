# Supabase Tables Setup — IMMEDIATE FIX

## Problem
The app is trying to access `public.feedback`, `public.trainer_videos`, and `public.community_messages` tables, but they don't exist in your Supabase database. The error message: **"Could not find the table in the schema cache"** means Supabase looked for these tables but they're missing.

## Solution — Run These Steps NOW

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard: https://app.supabase.com
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**

### Step 2: Run This Complete SQL (Copy-Paste All)
```sql
-- Step 1: Ensure pgcrypto extension exists
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

-- Step 5: TEMPORARY: Allow public access for testing (replace with RLS policies later)
grant select, insert on table public.feedback to anon;
grant select, insert on table public.trainer_videos to anon;
grant select, insert on table public.community_messages to anon;

-- Step 6: Verify tables exist
select 
  table_name
from information_schema.tables 
where table_schema = 'public' 
  and table_name in ('feedback', 'trainer_videos', 'community_messages')
order by table_name;
```

### Step 3: Run the Query
1. Click **Run** (or Ctrl+Enter)
2. You should see **3 rows returned** at the bottom: `community_messages`, `feedback`, `trainer_videos`

### Step 4: Refresh Supabase Dashboard
1. Go to **Table Editor** (left sidebar)
2. Click **Refresh** (top-right) or press F5
3. You should now see the 3 new tables in the left list

### Step 5: Reload Your App
1. Go to http://localhost:8080/ in your browser
2. Open the Admin Panel
3. Try the Feedback tab and Video Upload tab again
4. **Errors should be gone!**

## If You Still See Errors After Running SQL

### Check 1: Verify Tables Exist
Run this in SQL Editor (to confirm):
```sql
select table_schema, table_name, column_name 
from information_schema.columns 
where table_schema = 'public' 
  and table_name in ('feedback', 'trainer_videos', 'community_messages')
order by table_name, ordinal_position;
```

### Check 2: Verify App is Connected to Correct Supabase Project
1. Open browser DevTools (F12 → Console)
2. Type: `import.meta.env.VITE_SUPABASE_URL`
3. Copy the URL shown
4. Go to Supabase dashboard → Project Settings → API
5. Check if the URL matches your project

### Check 3: Clear Browser Cache and Reload
1. Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
2. Clear cache for the last hour
3. Reload http://localhost:8080/

## If SQL Fails to Run

### Error: "relation already exists"
→ Run the version WITH the `drop table if exists` lines (provided above)

### Error: "permission denied"
→ Your Supabase role doesn't have permission. Contact Supabase support or use a role with superuser privileges.

### Error: "extension not found"
→ Replace `create extension if not exists pgcrypto;` with:
```sql
select * from pg_available_extensions where name = 'pgcrypto';
```
If pgcrypto doesn't appear, your Supabase project may not support it (rare).

## Security Note (for production)
The `grant` statements in the SQL above allow **anyone** to insert feedback. For production:
1. Remove the `grant` lines
2. Enable Row Level Security (RLS) on the tables
3. Create policies that restrict access by authenticated user ID (I can help with this)

For now, these grants are safe for local/dev testing.

---

## Quick Reference: What Each Table Is For

| Table | Purpose |
|-------|---------|
| `feedback` | Store user feedback from /feedback page and Admin Panel |
| `trainer_videos` | Store workout video metadata (title, URL, trainer name, etc.) |
| `community_messages` | Store community chat messages |

---

**Copy the SQL from "Step 2" above, paste it into Supabase SQL Editor, click Run, and report back the result!**
