# Water Reminder Testing Guide

## How to Test Water Reminders

### Step 1: Clear Previous Settings
1. Open browser console (F12)
2. Run: `localStorage.removeItem('notification_settings')`
3. Refresh the page

### Step 2: Enable Water Reminders
1. Go to Water page
2. Scroll to "Notification Settings" section
3. Turn ON "Water Reminder"
4. Set interval to **1 minute** (for testing - easier than waiting 30 minutes)
5. Click "Save Notification Settings"

### Step 3: Verify Immediate Notification
- You should see a notification appear IMMEDIATELY after clicking Save
- This confirms the system is working

### Step 4: Wait for Recurring Notification
- Wait 1 minute (60 seconds)
- You should see another notification appear
- Check browser console for logs like:
  ```
  💧 Water reminder timer triggered at: [time]
  ```

### Step 5: Test Persistence
1. Navigate to another page (Dashboard, Diet, etc.)
2. Wait for the next interval (1 minute)
3. You should STILL receive notifications even though you're not on the Water page
4. This confirms timers persist across navigation

## Console Commands for Debugging

### Check if reminders are running:
```javascript
// This will show you the current timer IDs
console.log('Checking reminder service state...');
```

### Check saved settings:
```javascript
const settings = localStorage.getItem('notification_settings');
console.log('Saved settings:', JSON.parse(settings));
```

### Manually trigger a test notification:
```javascript
if (Notification.permission === 'granted') {
  new Notification('Test', { body: 'This is a test notification' });
} else {
  console.log('Permission not granted. Current:', Notification.permission);
}
```

## Expected Console Logs

When you save settings, you should see:
```
💾 Saved notification settings to localStorage: {waterReminder: true, waterInterval: 1, ...}
🔔 Initializing reminders with settings: {waterReminder: true, waterInterval: 1, ...}
✅ Settings changed or first initialization, proceeding...
💧 Starting water reminders every 1 minutes (60000ms)
💧 First reminder will appear immediately
💧 Sending immediate water reminder!
💧 Timer ID created: [number]
💧 Timer will fire every 60000ms (1 minutes)
✅ Reminders initialized successfully
```

Every minute after that, you should see:
```
💧 Water reminder timer triggered at: [time]
✅ water device notification sent
```

## Troubleshooting

### Problem: No immediate notification
- Check notification permission: `Notification.permission`
- Should be "granted"
- If "denied", you need to reset site permissions in browser settings

### Problem: First notification works, but no recurring notifications
- Check console for timer logs
- Look for "Water reminder timer triggered" messages
- If missing, the timer might have been cleared

### Problem: Notifications stop when navigating away
- This was the bug we just fixed
- Make sure you're using the latest code
- The reminderService should persist timers globally

### Problem: Multiple notifications at once
- This means multiple timers were created
- Refresh the page to clear old timers
- The new code prevents this with settings comparison

## Quick Test (1 minute intervals)

1. Set water interval to 1 minute
2. Save settings
3. You should get notifications at:
   - 0:00 (immediate)
   - 1:00 (first recurring)
   - 2:00 (second recurring)
   - 3:00 (third recurring)
   - etc.

4. Navigate to different pages - notifications should continue

## Production Settings

Once testing is complete, set realistic intervals:
- Water: 30-60 minutes
- Meal: 180-240 minutes (3-4 hours)
