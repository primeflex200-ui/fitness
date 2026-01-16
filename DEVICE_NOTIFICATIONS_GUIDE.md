# 📱 Device Notifications Guide

## Overview
Your app now sends **native device notifications** (system notifications) instead of in-app toasts. These appear in your system notification tray/center just like notifications from other apps.

## ✅ What Changed

### Before:
- Notifications showed as toasts inside the app
- Only visible when app was open
- No sound or system integration

### After:
- **Native device notifications** appear in system tray
- Work even when app is in background
- Play notification sound
- Show in Windows Action Center / Mac Notification Center
- Click notification to focus the app

## 🔔 How It Works

### 1. Permission Request
When you click **"Save & Start Reminders"** or **"Test Device Notification"**:
- Browser asks: "Allow notifications from this site?"
- Click **"Allow"** to enable device notifications
- Permission is saved for future visits

### 2. Notification Types
- **💧 Water Reminders** - Hydration alerts at your chosen interval
- **🍽️ Meal Reminders** - Diet plan notifications
- **💪 Workout Reminders** - Daily training alerts

### 3. Notification Features
- **Sound** - Plays system notification sound
- **Auto-close** - Closes after 10 seconds
- **Click to focus** - Clicking brings app to foreground
- **System integration** - Shows in notification center

## 🎯 How to Use

### Enable Notifications:
1. Go to **Settings** page
2. Toggle on the reminders you want (Water, Meal, Workout)
3. Set your preferred intervals
4. Click **"Save & Start Reminders"**
5. Allow notifications when browser asks
6. Done! You'll get device notifications

### ✅ Settings Persist Automatically:
- Your settings are saved to **localStorage** (instant)
- Also saved to **database** (backup)
- Reminders automatically restart when you:
  - Refresh the page
  - Navigate away and come back
  - Close and reopen the app
- No need to click "Save" again!

### Test Notifications:
1. Click **"Test Device Notification"** button
2. Allow notifications if prompted
3. Check your system notification tray
4. You should see: "💧 Test Device Notification"

### Stop Notifications:
- Click **"Stop All"** button to pause all reminders
- Reminders will stop until you click "Save & Start" again

## 🔧 Troubleshooting

### Not Seeing Notifications?

**Check Browser Permission:**
1. Click the lock icon in address bar
2. Look for "Notifications" setting
3. Make sure it's set to "Allow"

**Check System Settings:**
- **Windows**: Settings → System → Notifications
- **Mac**: System Preferences → Notifications
- Make sure browser notifications are enabled

**Check Do Not Disturb:**
- Disable Do Not Disturb mode
- Check Focus Assist (Windows) or Focus (Mac)

### Permission Denied?

If you accidentally clicked "Block":
1. Click lock icon in address bar
2. Find "Notifications" → Change to "Allow"
3. Refresh the page
4. Try again

## 📊 Notification Intervals

You can set any interval from **1 to 1440 minutes** (24 hours):
- **1 minute** - For testing
- **30 minutes** - Frequent reminders
- **60 minutes** - Hourly (default for water)
- **180 minutes** - Every 3 hours (default for meals)
- **1440 minutes** - Once per day

## 🎨 Notification Appearance

### Water Reminder:
```
💧 Hydration Time!
Time to drink some water. Stay hydrated! 🚰
```

### Meal Reminder:
```
🍽️ Meal Time!
Time for your next meal. Check your diet plan! 🥗
```

### Workout Reminder:
```
💪 Workout Time!
Time to crush your workout! Let's go! 🏋️
```

## 🔐 Privacy & Data

- Notifications are sent locally by your browser
- No external services involved
- Permission is stored by your browser
- Notification history saved in database (optional)
- You can revoke permission anytime

## 💡 Tips

1. **Test First** - Use "Test Device Notification" before setting up reminders
2. **Start Small** - Begin with longer intervals, adjust as needed
3. **Check Sound** - Make sure system volume is on
4. **Background Mode** - Notifications work even when app is minimized
5. **Multiple Devices** - Each device needs its own permission

## 🚀 Next Steps

1. Enable your preferred reminders
2. Set comfortable intervals
3. Test to make sure it works
4. Adjust as needed
5. Stay hydrated and on track! 💪

---

**Note**: Device notifications require browser support. Works on:
- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (Desktop & Mobile)
- ✅ Opera (Desktop)

**Not supported on**:
- ❌ Very old browsers
- ❌ Browsers with notifications disabled
- ❌ Incognito/Private mode (some browsers)
