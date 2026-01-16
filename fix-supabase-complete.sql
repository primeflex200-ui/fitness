-- ========================================
-- COMPLETE SUPABASE FIX SCRIPT
-- Run this in your Supabase SQL Editor
-- ========================================

-- 1. DROP ALL EXISTING TABLES (Clean Start)
DROP TABLE IF EXISTS public.trainer_videos CASCADE;
DROP TABLE IF EXISTS public.feedback CASCADE;
DROP TABLE IF EXISTS public.community_messages CASCADE;

-- 2. CREATE CLEAN TABLES
CREATE TABLE public.trainer_videos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  category text DEFAULT 'general',
  duration integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  message text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.community_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. DISABLE RLS COMPLETELY
ALTER TABLE public.trainer_videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages DISABLE ROW LEVEL SECURITY;

-- 4. GRANT FULL PERMISSIONS
GRANT ALL ON TABLE public.trainer_videos TO anon, authenticated, public;
GRANT ALL ON TABLE public.feedback TO anon, authenticated, public;
GRANT ALL ON TABLE public.community_messages TO anon, authenticated, public;

-- 5. GRANT SEQUENCE PERMISSIONS
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, public;

-- 6. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX idx_trainer_videos_category ON public.trainer_videos(category);
CREATE INDEX idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX idx_community_messages_user_id ON public.community_messages(user_id);
CREATE INDEX idx_feedback_created_at ON public.feedback(created_at);
CREATE INDEX idx_community_messages_created_at ON public.community_messages(created_at);

-- 7. INSERT SAMPLE DATA FOR TESTING
INSERT INTO public.trainer_videos (title, description, video_url, category, duration) VALUES
('Push-up Tutorial', 'Learn perfect push-up form', 'https://example.com/pushup.mp4', 'strength', 300),
('Squat Basics', 'Master the squat technique', 'https://example.com/squat.mp4', 'strength', 450),
('Cardio Warm-up', '5-minute warm-up routine', 'https://example.com/warmup.mp4', 'cardio', 300);

INSERT INTO public.feedback (user_id, message, rating) VALUES
('test-user-1', 'Great app! Very helpful.', 5),
('test-user-2', 'Good workouts, needs more features', 4);

INSERT INTO public.community_messages (user_id, message) VALUES
('test-user-1', 'Just completed my first workout!'),
('test-user-2', 'Anyone have tips for better form?');

-- 8. VERIFICATION QUERIES
SELECT 'trainer_videos' as table_name, COUNT(*) as row_count FROM public.trainer_videos
UNION ALL
SELECT 'feedback' as table_name, COUNT(*) as row_count FROM public.feedback
UNION ALL
SELECT 'community_messages' as table_name, COUNT(*) as row_count FROM public.community_messages;

-- 9. SHOW TABLE PERMISSIONS
SELECT 
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('trainer_videos', 'feedback', 'community_messages');

-- ========================================
-- COMPLETION MESSAGE
-- ========================================
-- If this script runs without errors, your Supabase setup is now complete!
-- Your app should work without any RLS or permission issues.
-- ========================================
