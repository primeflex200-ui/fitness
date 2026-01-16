# Troubleshooting: Progress Link Not Opening

## Quick Diagnosis

### Step 1: Check if you're logged in
The Progress page requires authentication. Make sure you're logged in to the app.

### Step 2: Check the database table
The Progress page needs the `progress_tracking` table to exist in Supabase.

**Run this SQL in Supabase SQL Editor:**

```sql
-- Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'progress_tracking'
);
```

If it returns `false`, run the setup SQL from `create-progress-tracking-table.sql`

### Step 3: Try direct URL
Instead of clicking the link, try typing directly in the browser:
```
http://localhost:5173/progress
```
(or your deployed URL + `/progress`)

### Step 4: Check browser console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Click the Progress link
4. Look for any error messages

## Common Issues & Solutions

### Issue 1: "Table does not exist" error
**Solution:** Run the SQL script to create the table:
```bash
# In Supabase SQL Editor, run:
project-bolt-github-uarm9gkh/flex-zen-coach/create-progress-tracking-table.sql
```

### Issue 2: Link does nothing when clicked
**Possible causes:**
- JavaScript error preventing navigation
- React Router issue
- Authentication redirect

**Solution:** Check browser console for errors

### Issue 3: Blank page after clicking
**Possible causes:**
- Database query failing
- Missing data
- RLS policy blocking access

**Solution:** 
1. Check browser console
2. Verify RLS policies are set correctly
3. Make sure you're logged in

### Issue 4: "Permission denied" or RLS error
**Solution:** Run these RLS policies in Supabase:

```sql
-- Enable RLS
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own progress"
  ON progress_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON progress_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON progress_tracking FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

## Testing the Link

### From Dashboard:
1. Go to Dashboard (`/dashboard`)
2. Look for the "Progress Tracking" card (first card, top-left)
3. Click on it
4. Should navigate to `/progress`

### Direct Navigation:
```typescript
// In browser console, try:
window.location.href = '/progress'
```

## Verify Route is Working

Run this in your browser console while on the app:
```javascript
// Check if route exists
console.log(window.location.pathname);

// Try navigating
window.history.pushState({}, '', '/progress');
window.location.reload();
```

## Database Setup Checklist

- [ ] `progress_tracking` table created
- [ ] RLS policies enabled
- [ ] User is authenticated
- [ ] User has valid session token
- [ ] Table has correct columns:
  - id (UUID)
  - user_id (UUID)
  - date (DATE)
  - completed_exercises (TEXT[])
  - total_exercises (INTEGER)
  - completion_percentage (INTEGER)
  - weekly_stats (JSONB)
  - monthly_trend (JSONB)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)

## Still Not Working?

### Enable Debug Mode:

Add this to your Progress.tsx temporarily:

```typescript
useEffect(() => {
  console.log("Progress page mounted");
  console.log("User:", user);
  console.log("Loading:", loading);
  console.log("Daily Progress:", dailyProgress);
}, [user, loading, dailyProgress]);
```

### Check Network Tab:
1. Open DevTools (F12)
2. Go to Network tab
3. Click Progress link
4. Look for failed requests (red)
5. Check the response for error messages

## Quick Fix: Create Test Data

If the page loads but shows no data, create some test data:

```sql
-- Insert test progress data
INSERT INTO progress_tracking (
  user_id,
  date,
  completed_exercises,
  total_exercises,
  completion_percentage,
  weekly_stats,
  monthly_trend
) VALUES (
  auth.uid(), -- Your user ID
  CURRENT_DATE,
  ARRAY['Bench Press', 'Squats'],
  5,
  40,
  '{"Mon": 50, "Tue": 75}'::jsonb,
  '{"Week 1": 60, "Week 2": 70}'::jsonb
);
```

## Contact Info

If none of these solutions work, please provide:
1. Browser console errors (screenshot)
2. Network tab errors (screenshot)
3. Supabase table structure (screenshot)
4. Whether you're logged in (yes/no)
5. What happens when you click the link (describe)

This will help diagnose the exact issue!
