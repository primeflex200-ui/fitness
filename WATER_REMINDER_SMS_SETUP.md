# 💧 Water Reminder SMS Setup Guide

## Overview
This guide will help you set up SMS water reminders for your PRIME FLEX app using Twilio.

---

## Step 1: Create Twilio Account

1. Go to [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free account
3. Verify your email and phone number
4. Complete the setup wizard

---

## Step 2: Get Twilio Credentials

After signing up, go to your Twilio Console:

1. **Account SID**: Found on the main dashboard
2. **Auth Token**: Click "Show" to reveal it
3. **Phone Number**: Get a free Twilio phone number
   - Go to Phone Numbers → Manage → Buy a number
   - Select a number with SMS capability

**Save these 3 values:**
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

---

## Step 3: Add Database Column

Run this SQL in your Supabase SQL Editor:

```sql
-- Add phone_number column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Add water reminder settings
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS water_reminder_enabled BOOLEAN DEFAULT false;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS water_reminder_interval INTEGER DEFAULT 60;
```

---

## Step 4: Deploy Supabase Edge Function

### Install Supabase CLI (if not installed)
```bash
npm install -g supabase
```

### Login to Supabase
```bash
supabase login
```

### Link your project
```bash
cd flex-zen-coach
supabase link --project-ref YOUR_PROJECT_REF
```

### Set Twilio secrets
```bash
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
supabase secrets set TWILIO_PHONE_NUMBER=+1234567890
```

### Deploy the function
```bash
supabase functions deploy send-water-reminder
```

---

## Step 5: Test the SMS

1. Go to Settings in your app
2. Enter your phone number (with country code, e.g., +91 9876543210)
3. Click "Save Phone Number"
4. Click "Send Test SMS"
5. Check your phone for the message!

---

## Step 6: Set Up Scheduled Reminders (Optional)

For automatic scheduled reminders, you can use:

### Option A: Supabase Cron Jobs (pg_cron)
```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to send reminders
CREATE OR REPLACE FUNCTION send_water_reminders()
RETURNS void AS $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT phone_number 
    FROM profiles 
    WHERE water_reminder_enabled = true 
    AND phone_number IS NOT NULL
  LOOP
    -- Call edge function via HTTP
    PERFORM net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-water-reminder',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
      body := json_build_object('phone', user_record.phone_number, 'message', '💧 Time to drink water! Stay hydrated!')::jsonb
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule to run every hour
SELECT cron.schedule('water-reminders', '0 * * * *', 'SELECT send_water_reminders()');
```

### Option B: External Cron Service
Use services like:
- [cron-job.org](https://cron-job.org) (Free)
- [EasyCron](https://www.easycron.com)
- GitHub Actions scheduled workflows

---

## Troubleshooting

### "SMS service not configured"
- Make sure you've set all 3 Twilio secrets in Supabase
- Verify the secrets are correct (no extra spaces)

### "Failed to send SMS"
- Check if your Twilio account has credits
- Verify the phone number format includes country code
- Check Twilio console for error logs

### "Phone number not verified"
- On Twilio trial accounts, you can only send to verified numbers
- Add your phone to Verified Caller IDs in Twilio console

---

## Costs

**Twilio Pricing:**
- Free trial: $15 credit
- SMS to India: ~$0.04 per message
- SMS to US: ~$0.0075 per message

**Estimated monthly cost:**
- 8 reminders/day × 30 days = 240 SMS
- India: ~$9.60/month
- US: ~$1.80/month

---

## Need Help?

Contact us on Instagram: [@primeflex__official](https://instagram.com/primeflex__official)
