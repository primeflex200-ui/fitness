# Notification Reminders Integration Guide

## Overview
Complete integration of in-app notification reminders with Supabase database.

## Features ✅
- 💧 **Water Reminders** - Customizable interval (1-1440 minutes)
- 🍽️ **Meal Reminders** - Customizable interval (1-1440 minutes)
- 💪 **Workout Reminders** - Daily at 8 AM
- 🔔 **In-App Notifications** - Toast notifications with database storage
- 📊 **Notification History** - All notifications saved to database
- ⚙️ **Settings Sync** - Settings saved to both localStorage and database

## Setup Instructions

### Step 1: Run Database Setup

Run this SQL in Supabase SQL Editor:

```bash
setup-notification-reminders.sql
```

This will:
- ✅ Add notification columns to profiles table
- ✅ Create app_notifications table
- ✅ Set up RLS policies
- ✅ Create notification functions
- ✅ Add indexes for performance

### Step 2: Verify Database

Check that tables were created:

```sql
-- Check profiles columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name LIKE '%reminder%';

-- Check notifications table
SELECT * FROM app_notifications LIMIT 5;
```

### Step 3: Test the System

1. **Open your app** and login
2. **Go to Settings** → Notifications section
3. **Enable Water Reminders**
   - Set interval to `1` minute (for testing)
   - Wait 1 minute
   - You should see a toast notification: "💧 Hydration Time!"
4. **Enable Meal Reminders**
   - Set interval to `2` minutes (for testing)
   - Wait 2 minutes
   - You should see: "🍽️ Meal Time!"
5. **Check Database**
   ```sql
   SELECT * FROM app_notifications ORDER BY created_at DESC LIMIT 10;
   ```

## How It Works

### 1. Settings Page
- User toggles reminders on/off
- User sets custom intervals
- Settings save to localStorage + database
- Reminders initialize automatically

### 2. Reminder Service
- Runs timers in the background
- Sends notifications at specified intervals
- Saves notifications to database
- Shows toast notifications in app

### 3. Database Storage
- All settings stored in `profiles` table
- All notifications stored in `app_notifications` table
- Timestamps track last reminder sent
- RLS policies ensure user privacy

## API Reference

### ReminderService Methods

```typescript
// Save settings to database
await reminderService.saveSettings(userId, {
  workoutReminder: true,
  waterReminder: true,
  waterInterval: 60,
  mealReminder: true,
  mealInterval: 180
});

// Load settings from database
const settings = await reminderService.loadSettings(userId);

// Initialize reminders
await reminderService.initializeReminders(userId, settings);

// Send custom notification
await reminderService.sendNotification(
  userId,
  'water',
  'Custom Title',
  'Custom message'
);

// Get unread count
const count = await reminderService.getUnreadCount(userId);

// Get recent notifications
const notifications = await reminderService.getRecentNotifications(userId, 10);

// Stop all reminders
reminderService.stopAllReminders();
```

## Database Schema

### profiles table (new columns)
```sql
workout_reminder_enabled BOOLEAN DEFAULT true
water_reminder_enabled BOOLEAN DEFAULT true
water_reminder_interval INTEGER DEFAULT 60
meal_reminder_enabled BOOLEAN DEFAULT false
meal_reminder_interval INTEGER DEFAULT 180
last_water_reminder TIMESTAMPTZ
last_meal_reminder TIMESTAMPTZ
last_workout_reminder TIMESTAMPTZ
```

### app_notifications table
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES auth.users(id)
type TEXT -- 'water', 'meal', 'workout'
title TEXT
message TEXT
read BOOLEAN DEFAULT false
created_at TIMESTAMPTZ DEFAULT NOW()
```

## Notification Types

### Water Reminder 💧
- **Default**: Every 60 minutes
- **Customizable**: 1-1440 minutes
- **Message**: "Time to drink some water. Stay hydrated! 🚰"

### Meal Reminder 🍽️
- **Default**: Every 180 minutes (3 hours)
- **Customizable**: 1-1440 minutes
- **Message**: "Time for your next meal. Check your diet plan! 🥗"

### Workout Reminder 💪
- **Schedule**: Daily at 8:00 AM
- **Message**: "Time to crush your workout! Let's go! 🏋️"

## Testing Intervals

For testing, use short intervals:
- **1 minute** - See notification every minute
- **2 minutes** - See notification every 2 minutes
- **5 minutes** - See notification every 5 minutes

For production, use realistic intervals:
- **30 minutes** - Frequent reminders
- **60 minutes** - Hourly reminders
- **120 minutes** - Every 2 hours
- **180 minutes** - Every 3 hours

## Troubleshooting

### Notifications Not Showing

1. **Check browser console** for errors
2. **Verify database setup**:
   ```sql
   SELECT * FROM profiles WHERE id = 'YOUR_USER_ID';
   ```
3. **Check if reminders are running**:
   - Open console
   - Look for: "💧 Starting water reminders every X minutes"
4. **Verify RLS policies**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'app_notifications';
   ```

### Settings Not Saving

1. **Check console** for save errors
2. **Verify user is authenticated**
3. **Check database permissions**:
   ```sql
   GRANT ALL ON profiles TO authenticated;
   GRANT ALL ON app_notifications TO authenticated;
   ```

### Reminders Stop After Page Refresh

This is normal! Reminders run in the browser and restart when:
- User opens the app
- User goes to Settings page
- User changes reminder settings

For persistent reminders across sessions, you would need:
- Service Worker (for background notifications)
- Push Notifications API
- Or server-side cron jobs

## Future Enhancements

- 🔔 Push notifications (when app is closed)
- 📱 Mobile app notifications
- 🎯 Smart reminders based on activity
- 📊 Notification analytics
- ⏰ Custom notification times
- 🔕 Do Not Disturb mode
- 📅 Schedule-based reminders

## Status

✅ **Complete and Working!**

- Database schema created
- Reminder service implemented
- Settings page integrated
- In-app notifications working
- Settings persist across sessions
- Fully customizable intervals

---

**Last Updated**: December 2, 2025
**Version**: 1.0.0
