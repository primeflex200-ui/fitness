-- Fix Profiles Table - Add Missing Columns
-- Run this in Supabase SQL Editor

-- Add all missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS gender TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS height NUMERIC;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS weight NUMERIC;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS fitness_goal TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS diet_type TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS water_reminder_enabled BOOLEAN DEFAULT false;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS water_reminder_interval INTEGER DEFAULT 60;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_reminder_sent TIMESTAMPTZ;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Create or replace the trigger function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

SELECT 'Profiles table updated successfully!' as status;
