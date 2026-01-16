-- Setup Background Water Reminders
-- Run this in Supabase SQL Editor

-- 1. Add columns for water reminder settings
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS water_reminder_enabled BOOLEAN DEFAULT false;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS water_reminder_interval INTEGER DEFAULT 60;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_reminder_sent TIMESTAMPTZ;

-- 2. Enable pg_cron extension (for scheduled jobs)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 3. Enable pg_net extension (for HTTP requests)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 4. Create a function to call the edge function
CREATE OR REPLACE FUNCTION call_water_reminder_function()
RETURNS void AS $$
BEGIN
  -- Call the edge function via HTTP
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/scheduled-water-reminder',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  );
END;
$$ LANGUAGE plpgsql;

-- 5. Schedule the job to run every minute
-- Note: This requires pg_cron to be enabled in your Supabase project
SELECT cron.schedule(
  'water-reminder-job',
  '* * * * *',  -- Every minute
  'SELECT call_water_reminder_function()'
);

-- To check scheduled jobs:
-- SELECT * FROM cron.job;

-- To remove the job:
-- SELECT cron.unschedule('water-reminder-job');
