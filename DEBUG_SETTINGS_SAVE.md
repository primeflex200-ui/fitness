# Debug Settings Save Changes Issue

## What I Fixed

1. **Added `saving` state** - Shows "Saving..." on button while saving
2. **Added comprehensive logging** - Console logs at every step
3. **Added `.select()` to update query** - Returns updated data for verification
4. **Disabled buttons during save** - Prevents double-clicks

## How to Debug

### Step 1: Open Browser Console (F12)

When you click "Save Changes", you should see these logs in order:

```
1. "Starting save with profile data:" {full_name: "...", age: "...", ...}
2. "Updating profile with data:" {full_name: "...", age: 25, ...}
3. "Profile updated successfully:" [{...}]
```

### Step 2: Check for Errors

If you see any of these errors, follow the solution:

#### Error: "No user found, cannot save"
**Cause**: Not logged in or auth session expired
**Solution**: 
- Logout and login again
- Check if you're authenticated: `await supabase.auth.getUser()`

#### Error: "Validation failed"
**Cause**: Invalid data in form fields
**Solution**: 
- Check the validation error message
- Common issues:
  - Name is empty
  - Age is not between 13-120
  - Height is not between 50-300 cm
  - Weight is not between 20-500 kg

#### Error: "Failed to update profile: [error message]"
**Cause**: Database error (usually RLS policy issue)
**Solution**:
```sql
-- Check if UPDATE policy exists
SELECT * FROM pg_policies WHERE tablename = 'profiles' AND cmd = 'UPDATE';

-- If missing, create it:
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### Error: "An unexpected error occurred while saving"
**Cause**: Network error or unexpected exception
**Solution**:
- Check network tab in DevTools
- Verify Supabase connection
- Check if profiles table exists

### Step 3: Verify Database Update

After clicking Save Changes, check if data was actually saved:

```sql
-- In Supabase SQL Editor:
SELECT * FROM profiles WHERE id = 'YOUR_USER_ID';
```

### Step 4: Check RLS Policies

Run this to verify all policies are set up:

```sql
-- Check all policies on profiles table
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';
```

**Required policies:**
- SELECT policy: `auth.uid() = id`
- INSERT policy: `auth.uid() = id`
- UPDATE policy: `auth.uid() = id`

## Common Issues & Solutions

### Issue 1: Button doesn't respond when clicked
**Symptoms**: No console logs appear
**Cause**: onClick handler not attached or JavaScript error
**Solution**:
- Check browser console for JavaScript errors
- Verify React is rendering properly
- Try hard refresh (Ctrl+Shift+R)

### Issue 2: "Saving..." appears but never completes
**Symptoms**: Button stays disabled, no success/error message
**Cause**: Promise never resolves (network timeout or error)
**Solution**:
- Check Network tab in DevTools
- Look for failed requests to Supabase
- Verify Supabase URL and anon key in `.env`

### Issue 3: Success message shows but data doesn't persist
**Symptoms**: Toast says "Profile updated successfully!" but data reverts
**Cause**: Update succeeded but fetchProfile() fails to reload
**Solution**:
- Check console for "Error fetching profile" after save
- Verify SELECT policy exists
- Check if profile row exists in database

### Issue 4: Validation errors for valid data
**Symptoms**: Error message even though data looks correct
**Cause**: Data type mismatch or whitespace issues
**Solution**:
- Check if age/height/weight are numbers (not strings with letters)
- Trim whitespace from name field
- Ensure gender/fitness_goal/diet_type match enum values

## Testing Checklist

Test each field individually:

- [ ] Update name only → Save → Check if persisted
- [ ] Update age only → Save → Check if persisted
- [ ] Update gender only → Save → Check if persisted
- [ ] Update height only → Save → Check if persisted
- [ ] Update weight only → Save → Check if persisted
- [ ] Update fitness goal only → Save → Check if persisted
- [ ] Update diet type only → Save → Check if persisted
- [ ] Update all fields → Save → Check if all persisted

## Quick Test Script

Run this in browser console to test the save function directly:

```javascript
// Get current user
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);

// Try to update profile
const { data, error } = await supabase
  .from('profiles')
  .update({ full_name: 'Test Name' })
  .eq('id', user.id)
  .select();

console.log('Update result:', { data, error });
```

If this works, the issue is in the UI. If it fails, the issue is in the database/RLS.

## Expected Console Output (Success)

```
Starting save with profile data: {
  full_name: "John Doe",
  email: "john@example.com",
  age: "25",
  gender: "male",
  height: "175",
  weight: "70",
  fitness_goal: "muscle_gain",
  diet_type: "non_veg"
}

Updating profile with data: {
  full_name: "John Doe",
  age: 25,
  gender: "male",
  height: 175,
  weight: 70,
  fitness_goal: "muscle_gain",
  diet_type: "non_veg"
}

Profile updated successfully: [{
  id: "...",
  email: "john@example.com",
  full_name: "John Doe",
  age: 25,
  gender: "male",
  height: 175,
  weight: 70,
  fitness_goal: "muscle_gain",
  diet_type: "non_veg",
  created_at: "..."
}]

Fetching profile for user: ...
Profile data loaded: {...}
Setting loading to false
```

## Need More Help?

1. **Copy all console logs** and share them
2. **Check Network tab** for failed requests
3. **Run test-settings-page.sql** to verify database setup
4. **Check Supabase logs** in dashboard for server-side errors

---

**Last Updated**: December 2, 2025
