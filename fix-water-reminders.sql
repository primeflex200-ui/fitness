-- Water Reminder System - Database Setup (Optional)
-- The reminder system works with localStorage, but you can optionally store settings in database

-- Add reminder settings columns to profiles table (if not already present)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS water_reminder_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS water_reminder_interval INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS meal_reminder_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS meal_reminder_interval INTEGER DEFAULT 180,
ADD COLUMN IF NOT EXISTS workout_reminder_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_water_reminder TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_meal_reminder TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_workout_reminder TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_reminders ON profiles(water_reminder_enabled, meal_reminder_enabled, workout_reminder_enabled);

-- Verify the columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name LIKE '%reminder%'
ORDER BY column_name;

-- Note: The reminder system currently uses localStorage for instant performance
-- Database storage is optional and can be added later for cross-device sync
