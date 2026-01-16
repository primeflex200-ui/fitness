-- Add phone_number column to profiles table for SMS reminders
-- Run this in Supabase SQL Editor

-- Add phone_number column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Add water_reminder_enabled column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS water_reminder_enabled BOOLEAN DEFAULT false;

-- Add water_reminder_interval column (in minutes)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS water_reminder_interval INTEGER DEFAULT 60;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON profiles(phone_number);

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('phone_number', 'water_reminder_enabled', 'water_reminder_interval');
