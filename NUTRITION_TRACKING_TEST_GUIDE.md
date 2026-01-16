# 🧪 Nutrition Tracking - Complete Test Guide

## ✅ Implementation Complete

All code is implemented and ready. Here's how to test:

---

## 📋 Pre-Test Checklist

1. ✅ SQL table created (ran `create-meal-completions-table.sql`)
2. ✅ Dev server running (`npm run dev`)
3. ✅ Logged into the app
4. ✅ Browser console open (F12)

---

## 🧪 Test Procedure

### Step 1: Check Meals in Diet Plan Tracker

1. Go to **Diet Plans** → **Track Your Diet**
2. Select today's day (e.g., Tuesday)
3. **Check 2-3 meals** (click the checkboxes)
4. You should see: "✅ [Food name] completed! 🎉"

### Step 2: Save to Database

1. Scroll to bottom of page
2. Click **"Save Progress to Tracking"** button
3. **Expected Result:**
   - Toast message: "✅ Saved X meals to Progress Tracking!"
   - Console logs:
     ```
     💾 Saving meal to database: {...}
     ✅ Meal saved successfully
     ```

### Step 3: View in Progress Tracking

1. Go to **Progress Tracking** page
2. **Expected Result:**
   - "Today's Nutrition" card shows:
     - Consumed calories (e.g., 600 cal)
     - Protein (e.g., 40g)
     - Carbs (e.g., 60g)
     - Fats (e.g., 20g)
   - Console logs:
     ```
     🔍 Fetching nutrition data for: 2024-12-09
     📊 Nutrition query result: {meals: Array(2), ...}
     ✅ Nutrition totals: {totalCalories: 600, ...}
     ```

### Step 4: Manual Refresh (if needed)

1. On Progress page, click **"Refresh"** button in Nutrition card
2. Data should update immediately

---

## 🔍 Debugging Steps

### If No Data Shows Up:

#### 1. Check Browser Console

Open console (F12) and look for:

**When saving:**
- ❌ "No user found" → Not logged in
- ❌ "Database save error" → Check error message
- ✅ "Meal saved successfully" → Working!

**When loading:**
- ❌ "No user found" → Not logged in  
- ⚠️ "No completed meals found" → No data saved yet
- ✅ "Nutrition totals" → Working!

#### 2. Check Supabase Database

1. Go to Supabase Dashboard
2. Click **Table Editor** → **meal_completions**
3. Check if your meals are there:
   - `user_id` = your user ID
   - `completion_date` = today's date
   - `completed` = true
   - `calories`, `protein`, `carbs`, `fats` have values

#### 3. Check RLS Policies

Run this in Supabase SQL Editor:
```sql
-- Check if you can see your own data
SELECT * FROM meal_completions 
WHERE user_id = auth.uid();
```

If no results, RLS policies might be wrong. Re-run the table creation SQL.

#### 4. Use Test Page

1. Open `test-nutrition-tracking.html` in browser
2. Update `SUPABASE_URL` and `SUPABASE_ANON_KEY`
3. Run tests in order:
   - Test Connection
   - Check Table
   - Test Insert
   - Test Query

---

## 📊 Expected Console Output

### Successful Flow:

```
💾 Saving meal to database: {user_id: "...", day: "Tuesday", ...}
✅ Meal saved successfully
💾 Saving meal to database: {user_id: "...", day: "Tuesday", ...}
✅ Meal saved successfully
✅ Saved 2 meals to Progress Tracking!

🔍 Fetching nutrition data for: 2024-12-09 User: abc123...
📊 Nutrition query result: {meals: Array(2), error: null, count: 2}
✅ Nutrition totals: {totalCalories: 600, totalProtein: 40, totalCarbs: 60, totalFats: 20}
```

---

## 🎯 Success Criteria

✅ Meals save to database (check console + Supabase)
✅ Progress page shows nutrition data
✅ Auto-refresh works (updates every 5 seconds)
✅ Manual refresh button works
✅ Data persists after page reload

---

## 🚨 Common Issues & Fixes

### Issue: "No more alternatives available"
**Fix:** This is from the workout refresh feature, not nutrition tracking. Ignore it.

### Issue: Data shows 0 after saving
**Possible causes:**
1. Table doesn't exist → Run SQL
2. RLS blocking queries → Check policies
3. Wrong date format → Check console logs
4. Not logged in → Log in first

### Issue: Save button doesn't work
**Check:**
1. Console for errors
2. Network tab for failed requests
3. Supabase logs for RLS denials

---

## 📞 Still Not Working?

Send me:
1. Screenshot of browser console
2. Screenshot of Supabase `meal_completions` table
3. Any error messages you see

The system is fully implemented and should work once the table is created and you're logged in!
