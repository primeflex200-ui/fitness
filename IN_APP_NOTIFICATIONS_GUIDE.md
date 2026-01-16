# In-App Push Notifications Guide

## Overview
The app now supports in-app push notifications for water reminders instead of SMS. Users can schedule reminders that will appear as browser notifications even when the app is in the background.

## Features

### 1. Browser Push Notifications
- Native browser notifications using the Notification API
- Works even when the browser tab is in the background
- Customizable notification sound and vibration
- Auto-dismiss after 10 seconds

### 2. In-App Toast Notifications
- Simultaneous in-app toast messages
- Visible when the app is active
- Dismissible by user

### 3. Recurring Reminders
- Set custom intervals (e.g., every 30, 60, 90 minutes)
- Automatic rescheduling
- Persistent across browser sessions (using localStorage)

## How to Use

### For Users

1. **Enable Notifications**
   - Go to Settings page
   - Find "Water Reminder Notifications" section
   - Click "Enable Notifications"
   - Allow browser notification permission when prompted

2. **Set Reminder Interval**
   - Choose interval from dropdown (30, 60, 90, 120 minutes) or enter custom value
   - Reminders will start automatically

3. **Test Notification**
   - Click "Test Notification" button to see how reminders will look

4. **Disable Notifications**
   - Toggle the switch off to stop all reminders

### Settings Location
Navigate to: **Dashboard → Settings → Water Reminder Notifications**

## Technical Implementation

### Components Created

1. **NotificationContext.tsx**
   - Manages notification state
   - Handles permission requests
   - Syncs with database and localStorage

2. **notificationService.ts**
   - Core notification logic
   - Scheduling and cancellation
   - Browser Notification API wrapper

### Database Schema
```sql
-- Add to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS water_reminder_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS water_reminder_interval INTEGER DEFAULT 60;
```

### Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 16.4+)
- Opera: Full support

## Advantages Over SMS

1. **No Cost** - Free push notifications vs paid SMS
2. **Instant** - No network delays
3. **Rich Content** - Icons, images, actions
4. **Privacy** - No phone number required
5. **Reliable** - Works offline with service workers
6. **Cross-Platform** - Works on desktop and mobile browsers

## User Experience

### Notification Appearance
```
💧 Time to Hydrate!
It's been 60 minutes. Drink some water to stay hydrated!
```

### Notification Behavior
- **Sound**: Brief notification sound
- **Vibration**: 200ms-100ms-200ms pattern (mobile)
- **Duration**: Auto-dismiss after 10 seconds
- **Click**: Brings app to focus

## Privacy & Permissions

- Notifications require explicit user permission
- Permission is requested only when user enables feature
- Can be revoked anytime from browser settings
- No data sent to external servers
- All scheduling happens client-side

## Troubleshooting

### Notifications Not Showing
1. Check browser notification permissions
2. Ensure notifications are enabled in Settings
3. Check browser notification settings (not blocked)
4. Try test notification first

### Permission Denied
1. Reset permission in browser settings
2. Clear site data and try again
3. Use different browser if needed

### Notifications Stop After Browser Close
- This is expected behavior for basic implementation
- For persistent notifications, service workers are needed
- Current implementation works when browser is open

## Future Enhancements

1. **Service Worker Integration**
   - Notifications even when browser is closed
   - Background sync

2. **Multiple Reminder Types**
   - Workout reminders
   - Meal reminders
   - Sleep reminders

3. **Smart Scheduling**
   - Skip reminders during sleep hours
   - Adaptive intervals based on activity

4. **Notification History**
   - Track reminder completion
   - Statistics and insights

## Code Example

```typescript
import { useNotifications } from '@/contexts/NotificationContext';

function MyComponent() {
  const { 
    enableNotifications, 
    setWaterReminderInterval,
    testNotification 
  } = useNotifications();

  const handleEnable = async () => {
    const success = await enableNotifications();
    if (success) {
      setWaterReminderInterval(60); // 60 minutes
    }
  };

  return (
    <button onClick={handleEnable}>
      Enable Water Reminders
    </button>
  );
}
```

## Summary

The in-app notification system provides a modern, cost-effective alternative to SMS reminders. It offers better user experience, requires no phone number, and works seamlessly across devices. Users have full control over their notification preferences and can customize reminder intervals to fit their hydration needs.
