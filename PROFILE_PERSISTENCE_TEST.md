# 🧪 Profile Persistence Test Guide

## Test Checklist

Use this checklist to verify that profile settings persist correctly.

### ✅ Test 1: Basic Save and Load
1. Go to **Settings** page
2. Click **Edit Profile**
3. Fill in:
   - Name: "Test User"
   - Age: 25
   - Gender: Male
   - Height: 175 cm
   - Weight: 70 kg
   - Fitness Goal: Muscle Gain
   - Diet Type: Non-Vegetarian
4. Click **Save Changes**
5. Navigate to **Dashboard**
6. Navigate back to **Settings**
7. **Expected**: All fields should show the saved values

**Status**: [ ] Pass [ ] Fail

---

### ✅ Test 2: Page Refresh
1. Go to **Settings** page
2. Edit and save profile with custom values
3. **Refresh the page** (F5 or Ctrl+R)
4. Go back to **Settings**
5. **Expected**: All profile fields preserved

**Status**: [ ] Pass [ ] Fail

---

### ✅ Test 3: Close and Reopen App
1. Go to **Settings** page
2. Edit and save profile
3. **Close the browser tab**
4. **Reopen the app** in a new tab
5. Login if needed
6. Go to **Settings**
7. **Expected**: All profile fields preserved

**Status**: [ ] Pass [ ] Fail

---

### ✅ Test 4: Multiple Navigation
1. Go to **Settings** page
2. Edit and save profile
3. Navigate: Dashboard → Progress → Workouts → Diet → Settings
4. **Expected**: Profile fields preserved
5. Navigate: Settings → Dashboard → Settings → Dashboard → Settings
6. **Expected**: Profile fields still preserved

**Status**: [ ] Pass [ ] Fail

---

### ✅ Test 5: Edit Mode Toggle
1. Go to **Settings** page
2. Click **Edit Profile**
3. Change name to "New Name"
4. Click **Cancel** (don't save)
5. **Expected**: Name reverts to previous value
6. Click **Edit Profile** again
7. Change name to "New Name"
8. Click **Save Changes**
9. Navigate away and back
10. **Expected**: Name is "New Name"

**Status**: [ ] Pass [ ] Fail

---

### ✅ Test 6: Partial Profile
1. Go to **Settings** page
2. Edit profile
3. Fill only Name and Age (leave others empty)
4. Click **Save Changes**
5. Navigate away and back
6. **Expected**: Name and Age preserved, others empty

**Status**: [ ] Pass [ ] Fail

---

### ✅ Test 7: Browser Console Check
1. Go to **Settings** page
2. Open **Developer Tools** (F12)
3. Go to **Console** tab
4. Edit and save profile
5. **Expected Console Logs**:
   - `Saving profile with data: {...}`
   - `✅ Profile saved to localStorage`
   - `✅ Profile saved to database successfully`
6. Navigate to **Dashboard** and back to **Settings**
7. **Expected Console Logs**:
   - `🔄 Loading profile for user: ...`
   - `✅ Loading profile from localStorage`
   - `✅ Profile loaded from localStorage: {...}`

**Status**: [ ] Pass [ ] Fail

---

### ✅ Test 8: LocalStorage Verification
1. Go to **Settings** page
2. Edit and save profile
3. Open **Developer Tools** (F12)
4. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
5. Click **Local Storage** → Your domain
6. Find key: `profile_<user_id>`
7. **Expected Value**: JSON with your profile data
```json
{
  "full_name": "Test User",
  "email": "user@example.com",
  "age": 25,
  "gender": "male",
  "height": 175,
  "weight": 70,
  "fitness_goal": "muscle_gain",
  "diet_type": "non_veg"
}
```

**Status**: [ ] Pass [ ] Fail

---

## 🐛 Troubleshooting

### Profile Not Persisting?

**Check 1: LocalStorage**
- Open DevTools → Application → Local Storage
- Look for `profile_<user_id>` key
- If missing, profile isn't being saved

**Check 2: Console Errors**
- Open DevTools → Console
- Look for red error messages
- Common issues:
  - Validation errors (invalid age, height, weight)
  - Database connection errors (profile still works via localStorage)
  - JSON parse errors (corrupted localStorage)

**Check 3: Edit Mode**
- Make sure you click "Save Changes" not "Cancel"
- Check for success toast message

### Fix: Clear and Reset
If profile is corrupted:
1. Open DevTools → Console
2. Run: `localStorage.removeItem('profile_<your_user_id>')`
3. Refresh page
4. Go to Settings and fill profile again

---

## ✅ Expected Behavior Summary

| Action | Expected Result |
|--------|----------------|
| Save profile | Saved to localStorage + database |
| Navigate away | Profile remains in localStorage |
| Navigate back | Profile loads from localStorage |
| Refresh page | Profile loads from localStorage |
| Close/reopen app | Profile loads from localStorage |
| Edit without saving | Changes discarded |
| Edit and save | Changes persist |

---

## 🎯 Success Criteria

All tests should **PASS** for the feature to be considered working correctly.

If any test fails:
1. Note which test failed
2. Check console for errors
3. Verify localStorage has correct data
4. Check if validation passed
5. Report the issue with test number

---

## 📝 Implementation Details

### How Persistence Works:

1. **Save Flow**:
   - User clicks "Save Changes"
   - Validation runs (age, height, weight ranges)
   - Profile saved to localStorage (instant)
   - Profile saved to database (backup)
   - Success toast shown

2. **Load Flow**:
   - Settings page loads
   - Checks localStorage for profile data
   - If found, loads instantly
   - Also checks database as backup
   - If database has data but localStorage doesn't, syncs to localStorage

3. **Navigation Flow**:
   - User navigates away → profile stays in localStorage
   - User navigates back → Settings page loads from localStorage
   - Fields show saved values instantly

### Key Components:

- **Settings.tsx**: Manages profile state and persistence
- **localStorage**: Primary storage (instant, reliable)
- **Database**: Backup storage (syncs across devices)
- **Validation**: Ensures data quality before saving

### Storage Keys:

- Profile: `profile_<user_id>`
- Notifications: `notification_settings`

Both use the same dual-storage strategy for maximum reliability.
