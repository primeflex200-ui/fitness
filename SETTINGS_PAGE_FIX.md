# Settings Page Fix Guide

## Issue Summary
The Settings page was stuck in loading state because the profile data wasn't loading properly.

## ✅ Code Fixes Applied

### 1. Settings.tsx - Fixed with Better Error Handling

**Added proper error handling to `fetchProfile()`:**
```typescript
const fetchProfile = async () => {
  if (!user) {
    setLoading(false);
    return;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    }

    if (data) {
      setProfile({
        full_name: data.full_name || "",
        email: data.email || user.email || "",
        age: data.age?.toString() || "",
        gender: data.gender || "",
        height: data.height?.toString() || "",
        weight: data.weight?.toString() || "",
        fitness_goal: data.fitness_goal || "",
        diet_type: data.diet_type || ""
      });
    }
  } catch (err) {
    console.error('Unexpected error loading profile:', err);
    toast.error('An unexpected error occurred');
  } finally {
    setLoading(false);
  }
};
```

**Added proper error handling to `handleSave()`:**
- Wrapped in try-catch block
- Shows specific error messages
- Logs errors to console for debugging

**Key improvements:**
- ✅ Always sets `loading` to `false` (using `finally` block)
- ✅ Shows error toasts if profile loading fails
- ✅ Falls back to user.email if profile.email is empty
- ✅ Handles both expected and unexpected errors
- ✅ Provides detailed error messages for debugging

## 🔍 Verification Steps

### Step 1: Check Database Columns
Make sure your Supabase `profiles` table has all required columns. Run this in Supabase SQL Editor:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

**Required columns:**
- `id` (UUID)
- `email` (TEXT)
- `full_name` (TEXT)
- `age` (INTEGER)
- `gender` (TEXT)
- `height` (NUMERIC)
- `weight` (NUMERIC)
- `fitness_goal` (TEXT)
- `diet_type` (TEXT)
- `phone_number` (TEXT)
- `water_reminder_enabled` (BOOLEAN)
- `water_reminder_interval` (INTEGER)
- `last_reminder_sent` (TIMESTAMPTZ)
- `created_at` (TIMESTAMP WITH TIME ZONE)

### Step 2: Add Missing Columns (if needed)
If any columns are missing, run the `fix-profiles-table.sql` script:

```bash
# In Supabase SQL Editor, run:
project-bolt-github-uarm9gkh/flex-zen-coach/fix-profiles-table.sql
```

### Step 3: Check RLS Policies
Verify that Row Level Security policies are set up correctly:

```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

**Required policies:**
1. Users can view own profile (SELECT)
2. Users can insert own profile (INSERT)
3. Users can update own profile (UPDATE)

### Step 4: Test the Settings Page

1. **Login to your app**
2. **Navigate to Settings** (from Dashboard → Settings icon)
3. **Check if the page loads** - You should see:
   - Your profile information
   - Edit Profile button
   - Notification settings
   - Appearance settings
   - About section
   - Instagram contact card

4. **Test Edit Profile**:
   - Click "Edit Profile"
   - Update your name, age, gender, height, weight, fitness goal, diet type
   - Click "Save Changes"
   - Verify the data is saved and displayed correctly

### Step 5: Check Browser Console
If the page still doesn't load:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any errors related to:
   - Supabase queries
   - Authentication
   - Profile loading

## 🐛 Common Issues & Solutions

### Issue 1: "Loading..." stuck forever
**Cause:** User is not authenticated or `fetchProfile()` is not being called

**Solution:**
- Check if you're logged in
- Verify AuthProvider is wrapping the app in `App.tsx`
- Check browser console for auth errors

### Issue 2: "Error loading profile" in console
**Cause:** Missing columns in profiles table or RLS policy issues

**Solution:**
- Run `fix-profiles-table.sql` to add missing columns
- Verify RLS policies are set up correctly
- Check if the user has a profile row in the database

### Issue 3: Profile data not saving
**Cause:** RLS policy blocking updates or validation errors

**Solution:**
- Check browser console for validation errors
- Verify RLS UPDATE policy exists
- Ensure data types match (age as number, height/weight as numbers)

### Issue 4: Email field is empty
**Cause:** Profile row doesn't have email populated

**Solution:**
```sql
-- Update profile with user's email
UPDATE profiles 
SET email = auth.users.email 
FROM auth.users 
WHERE profiles.id = auth.users.id;
```

## 📝 Testing Checklist

- [ ] Settings page loads without "Loading..." stuck
- [ ] Profile information displays correctly
- [ ] Edit Profile button works
- [ ] Can update name, age, gender
- [ ] Can update height and weight
- [ ] Can select fitness goal
- [ ] Can select diet type
- [ ] Save Changes button works
- [ ] Cancel button reverts changes
- [ ] Notification switches work
- [ ] Instagram link opens correctly
- [ ] Logout button works

## 🎯 Expected Behavior

When working correctly:
1. Page loads within 1-2 seconds
2. Shows user's profile data (or "Not set" for empty fields)
3. Edit mode allows updating all fields
4. Save button updates database and shows success toast
5. Cancel button reverts to original values
6. All switches and buttons are interactive

## 📞 Need Help?

If the Settings page still doesn't work after following these steps:

1. Check the browser console for specific error messages
2. Verify your Supabase connection in `.env` file
3. Test the database connection with a simple query
4. Check if other pages (Dashboard, Progress) are working

## ✨ Status

**Current Status:** ✅ Code is fixed and ready to test

**Next Steps:**
1. Verify database has all required columns
2. Test the Settings page
3. Report any remaining issues
