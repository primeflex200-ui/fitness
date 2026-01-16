-- ============================================
-- CREATE USER LOGIN DETAILS TABLE
-- ============================================
-- This table stores user login history and session information
-- Run this in Supabase SQL Editor

-- 1. Create the user_login_sessions table
CREATE TABLE IF NOT EXISTS public.user_login_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  device_info TEXT,
  login_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_token TEXT,
  refresh_token TEXT,
  ip_address TEXT,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  logout_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_login_sessions_user_id 
ON public.user_login_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_login_sessions_active 
ON public.user_login_sessions(is_active);

CREATE INDEX IF NOT EXISTS idx_user_login_sessions_login_time 
ON public.user_login_sessions(login_time DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.user_login_sessions ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies

-- Users can view their own login sessions
CREATE POLICY "Users can view own login sessions"
ON public.user_login_sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own login sessions
CREATE POLICY "Users can insert own login sessions"
ON public.user_login_sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own login sessions
CREATE POLICY "Users can update own login sessions"
ON public.user_login_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own login sessions
CREATE POLICY "Users can delete own login sessions"
ON public.user_login_sessions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 5. Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_login_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS trigger_update_user_login_sessions_updated_at 
ON public.user_login_sessions;

CREATE TRIGGER trigger_update_user_login_sessions_updated_at
BEFORE UPDATE ON public.user_login_sessions
FOR EACH ROW
EXECUTE FUNCTION update_user_login_sessions_updated_at();

-- 7. Create function to clean up old inactive sessions (optional)
CREATE OR REPLACE FUNCTION cleanup_old_login_sessions()
RETURNS void AS $$
BEGIN
  -- Delete sessions older than 30 days that are inactive
  DELETE FROM public.user_login_sessions
  WHERE is_active = false 
  AND logout_time < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if table was created
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_login_sessions';

-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_login_sessions'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'user_login_sessions';

-- ============================================
-- USAGE EXAMPLE
-- ============================================

-- Insert a login session (example)
-- INSERT INTO public.user_login_sessions (
--   user_id, 
--   email, 
--   device_info, 
--   session_token,
--   ip_address,
--   user_agent
-- ) VALUES (
--   auth.uid(),
--   'user@example.com',
--   'Android 13, PRIME FLEX App',
--   'session_token_here',
--   '192.168.1.1',
--   'Mozilla/5.0...'
-- );

-- Update last active time
-- UPDATE public.user_login_sessions
-- SET last_active = NOW()
-- WHERE user_id = auth.uid() AND is_active = true;

-- Logout (mark session as inactive)
-- UPDATE public.user_login_sessions
-- SET is_active = false, logout_time = NOW()
-- WHERE user_id = auth.uid() AND is_active = true;

-- Get user's active sessions
-- SELECT * FROM public.user_login_sessions
-- WHERE user_id = auth.uid() AND is_active = true
-- ORDER BY login_time DESC;

-- ============================================
-- DONE! ✅
-- ============================================
