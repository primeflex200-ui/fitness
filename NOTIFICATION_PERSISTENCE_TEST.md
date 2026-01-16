# 🧪 Notification Persistence Test Guide

## Test Checklist

Use this checklist to verify that notification settings persist correctly.

### ✅ Test 1: Basic Save and Load
1. Go to **Settings** page
2. Enable **Water Reminders**
3. Set interval to **1 minute** (for quick testing)
4. Click **"Save & Start Reminders"**
5. Allow notifications when prompted
6. Navigate to **Dashboard**
7. Navigate back to **Settings**
8. **Expected**: Water Reminders toggle should still be ON, interval should be 1 minute

**Status**: [ ] Pass [ ] Fail

---

### ✅ Test 2: Page Refresh
1. Go to **Settings** page
2. Enable **Water Reminders** and **Meal Reminders**
3. Set Water interval to **2 minutes**
4. Set Meal interval to **5 minutes**
5. Click **"Save & Start Reminders"**
6. **Refresh the page** (F5 or Ctrl+R)
7. Go back to **Settings**
8. **Expected**: Both toggles ON, intervals preserved

**Status**: [ ] Pass [ ] Fail

---

### ✅ Test 3: Close and Reopen App
1. Go to **Settings** page
2. Enable all reminders (Workout, Water, Meal)
3. Set custom intervals
4. Click **"Save & Start Reminders"**
5. **Close the browser tab**
6. **Reopen the app** in a new tab
7. Login if needed
8. Go to **Settings**
9. **Expected**: All toggles ON, all intervals preserved

**Status**: [ ] Pass [ ] Fail

---

### ✅ Test 4: Reminders Continue Working
1. Go to **Settings** page
2. Enable **Water Reminders**
3. Set interval to **1 minute**
4. Click **"Save & Start Reminders"**
5. Navigate to **Dashboard**
6. Wait **1 minute**
7. **Expected**: Device notification appears even though you're on Dashboard

**Status**: [ ] Pass [ ] Fail

---

### ✅ Test 5: Stop and Restart
1. Go to **Settings** page
2. Enable **Water Reminders** (1 minute interval)
3. Click **"Save & Start Reminders"**
4. Click **"Stop All"**
5. Navigate to **Dashboard**
6. Wait **1 minute**
7. **Expected**: NO notification (reminders stopped)
8. Go back to **Settings**
9. **Expected**: Toggle still ON (settings preserved)
10. Click **"Save & Start Reminders"** again
11. Wait **1 minute**
12. **Expected**: Notification appears (reminders restarted)

**Status**: [ ] Pass [ ] Fail

---

### ✅ Test 6: Multiple Navigation
1. Go to **Settings** page
2. Enable **Water Reminders** (1 minute)
3. Click **"Save & Start Reminders"**
4. Navigate: Dashboard → Progress → Workouts → Diet → Settings
5. **Expected**: Toggle still ON, interval preserved
6. Navigate: Settings → Dashboard → Settings → Dashboard → Settings
7. **Expected**: Toggle still ON, interval preserved

**Status**: [ ] Pass [ ] Fail

---

### ✅ Test 7: Browser Console Check
1. Go to **Settings** page
2. Open **Developer Tools** (F12)
3. Go to **Console** tab
4. Enable **Water Reminders**
5. Click **"Save & Start Reminders"**
6. **Expected Console Logs**:
   - `💾 Saving notification settings: {...}`
   - `✅ Saved to localStorage`
   - `✅ Reminder settings saved to database`
   - `💧 Starting water reminders every X minutes`
7. Navigate to **Dashboard** and back to **Settings**
8. **Expected Console Logs**:
   - `🔄 Loading notification settings for user: ...`
   - `✅ Loaded settings from localStorage: {...}`
   - `💧 Starting water reminders every X minutes`

**Status**: [ ] Pass [ ] Fail

---

### ✅ Test 8: LocalStorage Verification
1. Go to **Settings** page
2. Enable **Water Reminders** (2 minutes)
3. Enable **Meal Reminders** (5 minutes)
4. Click **"Save & Start Reminders"**
5. Open **Developer Tools** (F12)
6. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
7. Click **Local Storage** → Your domain
8. Find key: `notification_settings`
9. **Expected Value**:
```json
{
  "workoutReminder": true,
  "waterReminder": true,
  "waterInterval": 2,
  "mealReminder": true,
  "mealInterval": 5
}
```

**Status**: [ ] Pass [ ] Fail

---

## 🐛 Troubleshooting

### Settings Not Persisting?

**Check 1: LocalStorage**
- Open DevTools → Application → Local Storage
- Look for `notification_settings` key
- If missing, settings aren't being saved

**Check 2: Console Errors**
- Open DevTools → Console
- Look for red error messages
- Common issues:
  - Database connection errors (settings still work via localStorage)
  - JSON parse errors (corrupted localStorage)

**Check 3: Browser Permissions**
- Settings persist even without notification permission
- But notifications won't show without permission

### Fix: Clear and Reset
If settings are corrupted:
1. Open DevTools → Console
2. Run: `localStorage.removeItem('notification_settings')`
3. Refresh page
4. Go to Settings and configure again

---

## ✅ Expected Behavior Summary

| Action | Expected Result |
|--------|----------------|
| Save settings | Saved to localStorage + database |
| Navigate away | Settings remain in localStorage |
| Navigate back | Settings load from localStorage |
| Refresh page | Settings load from localStorage |
| Close/reopen app | Settings load from localStorage |
| Reminders running | Continue even when navigating |
| Stop reminders | Settings preserved, reminders paused |
| Restart reminders | Use saved settings |

---

## 🎯 Success Criteria

All tests should **PASS** for the feature to be considered working correctly.

If any test fails:
1. Note which test failed
2. Check console for errors
3. Verify localStorage has correct data
4. Check if database columns exist
5. Report the issue with test number

---

## 📝 Implementation Details

### How Persistence Works:

1. **Save Flow**:
   - User clicks "Save & Start Reminders"
   - Settings saved to localStorage (instant)
   - Settings saved to database (backup)
   - Reminders initialized with settings

2. **Load Flow**:
   - App loads → ReminderInitializer runs
   - Checks localStorage for saved settings
   - If found, reinitializes reminders automatically
   - Settings page loads → reads from localStorage
   - Also checks database as backup

3. **Navigation Flow**:
   - User navigates away → reminders keep running
   - User navigates back → Settings page loads from localStorage
   - Toggles and intervals show saved values

### Key Components:

- **ReminderInitializer**: Auto-restarts reminders on app load
- **Settings.tsx**: Loads settings on mount, saves on button click
- **reminderService.ts**: Manages reminder timers and persistence
- **localStorage**: Primary storage (instant, reliable)
- **Database**: Backup storage (syncs across devices)
