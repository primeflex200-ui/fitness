# Test Progress Tracking - Step by Step

## Setup Complete ✅
- Progress tracking service integrated
- Save button calls the service
- Debug logging added

## How to Test:

### Step 1: Open Browser Console
1. Press **F12** to open DevTools
2. Click on **Console** tab
3. Keep it open while testing

### Step 2: Go to Workouts Page
1. Navigate to `/workouts`
2. Make sure you're logged in

### Step 3: Click Save Button
1. Select a workout level (Beginner/Intermediate/Pro)
2. Choose a day (Push/Pull/Legs)
3. Click **"Save [Day] Day Plan"** button

### Step 4: Check Console Output
You should see these messages in console:
```
Saving workout with exercises: [array of exercises]
Saving progress tracking: {userId, date, totalExercises, ...}
Progress tracking saved successfully: [data]
Progress tracking result: {success: true, progressId: "..."}
```

### Step 5: Check Toast Message
You should see a green toast notification:
```
"Push workout saved! Progress tracking initialized."
```

### Step 6: Go to Progress Page
1. Navigate to `/progress`
2. You should see:
   - **Today's Progress: 0%**
   - **Exercises: 0/7** (or however many exercises)
   - The page should load (not stuck)

### Step 7: Check Exercise Boxes
1. Go back to Workouts page
2. Check some exercise checkboxes
3. Go to Progress page again
4. You should see the percentage update!

## If It's Not Working:

### Check Console for Errors
Look for RED error messages like:
- `Error saving progress: ...`
- `Progress tracking error: ...`
- `Failed to save workout progress`

### Common Errors:

#### Error: "relation 'progress_tracking' does not exist"
**Solution:** Run the SQL to create the table (see `create-progress-tracking-table.sql`)

#### Error: "new row violates row-level security policy"
**Solution:** RLS policies are blocking. Run this in Supabase:
```sql
ALTER TABLE progress_tracking DISABLE ROW LEVEL SECURITY;
```
Then test again. If it works, the issue is with RLS policies.

#### Error: "column 'user_id' does not exist"
**Solution:** Table structure is wrong. Drop and recreate the table.

### Check Supabase Dashboard
1. Go to Supabase Dashboard
2. Click **Table Editor**
3. Find `progress_tracking` table
4. Check if data was inserted after clicking save

## Expected Data in Database:

After clicking "Save Push Day Plan", you should see a row like:
```
id: uuid
user_id: your-user-id
date: 2024-12-02 (today)
completed_exercises: []
total_exercises: 7
completion_percentage: 0
weekly_stats: {}
monthly_trend: {}
created_at: timestamp
updated_at: timestamp
```

## Debug Checklist:

- [ ] Browser console is open
- [ ] Logged in to the app
- [ ] Clicked save button
- [ ] Saw console logs
- [ ] Saw toast notification
- [ ] Checked Supabase table
- [ ] Progress page loads
- [ ] Shows 0% initially

## Share With Me:

If it's still not working, please share:
1. **Console output** (copy-paste or screenshot)
2. **Toast message** (what does it say?)
3. **Supabase table** (screenshot of progress_tracking table)
4. **Any error messages** (red text in console)

This will help me identify the exact issue!
