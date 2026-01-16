-- =====================================================
-- NOTIFICATION REMINDERS SETUP
-- Integrates notification settings with database
-- =====================================================

-- Step 1: Add notification columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS workout_reminder_enabled BOOLEAN DEFAULT true;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS water_reminder_enabled BOOLEAN DEFAULT true;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS water_reminder_interval INTEGER DEFAULT 60;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS meal_reminder_enabled BOOLEAN DEFAULT false;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS meal_reminder_interval INTEGER DEFAULT 180;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_water_reminder TIMESTAMPTZ;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_meal_reminder TIMESTAMPTZ;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_workout_reminder TIMESTAMPTZ;

-- Step 2: Create notifications table for in-app notifications
CREATE TABLE IF NOT EXISTS app_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'water', 'meal', 'workout'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Enable RLS on notifications table
ALTER TABLE app_notifications ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies for notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON app_notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON app_notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON app_notifications;

CREATE POLICY "Users can view own notifications"
  ON app_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON app_notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON app_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Step 5: Create function to send notification
CREATE OR REPLACE FUNCTION send_app_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO app_notifications (user_id, type, title, message, created_at)
  VALUES (p_user_id, p_type, p_title, p_message, NOW())
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Step 6: Grant permissions
GRANT ALL ON app_notifications TO authenticated;
GRANT ALL ON app_notifications TO service_role;

-- Step 7: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON app_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON app_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON app_notifications(read);

-- Step 8: Verify setup
SELECT 
  '✅ Notification system setup complete!' as status,
  COUNT(*) as total_users,
  COUNT(water_reminder_enabled) as users_with_water_reminders
FROM profiles;

SELECT '🔔 Ready to send in-app notifications!' as message;
