-- Add notification settings columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS notification_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS water_reminder_interval INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS last_notification_time TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_notification_enabled 
ON profiles(notification_enabled) 
WHERE notification_enabled = true;

-- Update existing users to have default notification settings
UPDATE profiles 
SET notification_enabled = false,
    water_reminder_interval = 60
WHERE notification_enabled IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN profiles.notification_enabled IS 'Whether in-app notifications are enabled for this user';
COMMENT ON COLUMN profiles.water_reminder_interval IS 'Water reminder interval in minutes (default: 60)';
COMMENT ON COLUMN profiles.last_notification_time IS 'Timestamp of the last notification sent';
