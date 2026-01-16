# Meal Completions Table Setup Guide

## ✅ What's Been Done

1. **TypeScript Types Updated** - Added `meal_completions` table to `src/integrations/supabase/types.ts`
2. **Code Updated** - Removed `as any` type assertions from Progress and DietPlanTracker pages
3. **SQL Script Created** - Complete setup script in `SETUP_MEAL_COMPLETIONS_TABLE.sql`

## 🚀 How to Set Up the Database Table

### Step 1: Open Supabase Dashboard
1. Go to your Supabase project: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run the Setup Script
1. Click **New Query**
2. Copy the entire contents of `SETUP_MEAL_COMPLETIONS_TABLE.sql`
3. Paste it into the SQL editor
4. Click **Run** or press `Ctrl+Enter`

### Step 3: Verify Setup
The script will automatically verify:
- ✅ Table created with all columns
- ✅ RLS (Row Level Security) enabled
- ✅ Policies created for user access
- ✅ Indexes created for performance
- ✅ Triggers configured for auto-updates

You should see output showing:
- All columns in the table
- All RLS policies
- Success messages

## 📊 Table Structure

```sql
meal_completions
├── id (UUID, Primary Key)
├── user_id (UUID, Foreign Key → auth.users)
├── day (TEXT) - e.g., "Monday"
├── meal_name (TEXT) - e.g., "Breakfast-0"
├── food_name (TEXT) - e.g., "Oats with Milk"
├── calories (INTEGER)
├── protein (DECIMAL)
├── carbs (DECIMAL)
├── fats (DECIMAL)
├── completed (BOOLEAN)
├── completion_date (DATE)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## 🔒 Security (RLS Policies)

Users can only:
- ✅ View their own meal completions
- ✅ Insert their own meal completions
- ✅ Update their own meal completions
- ✅ Delete their own meal completions

## 🎯 How It Works

### When You Tick a Meal:
1. **Diet Plan Tracker** saves to `meal_completions` table
2. **Progress Page** fetches data every 5 seconds
3. **Daily Progress Bar** updates automatically
4. **Table** shows all completed meals
5. **Graph** displays calorie intake over time

### Example Flow:
```
User ticks "Breakfast - Oats (250 cal)"
    ↓
Saves to database:
{
  user_id: "abc123",
  day: "Monday",
  meal_name: "Breakfast-0",
  food_name: "Oats with Milk",
  calories: 250,
  protein: 10,
  carbs: 45,
  fats: 5,
  completed: true,
  completion_date: "2024-12-09"
}
    ↓
Progress page shows:
- Daily Progress: 18% (250/1360 cal)
- Table: 1 meal completed
- Graph: Point at breakfast time
```

## 🧪 Testing

After setup, test by:
1. Go to **Diet Plan Tracker**
2. Tick a meal (e.g., Breakfast)
3. Go to **Progress** page
4. You should see:
   - Daily Progress bar increase
   - Meal in the table
   - Point on the graph

## 🐛 Troubleshooting

### If meals don't show up:
1. Check browser console for errors
2. Verify table exists in Supabase
3. Check RLS policies are enabled
4. Ensure you're logged in

### If you get permission errors:
1. Re-run the SQL script
2. Make sure RLS policies are created
3. Check that `auth.uid()` matches your user ID

## 📝 Notes

- Data is stored per user (isolated by RLS)
- Meals are tracked by date
- Progress resets daily (new date = new tracking)
- Historical data is preserved for analytics

## ✨ Features Enabled

✅ Real-time meal tracking
✅ Daily progress calculation
✅ Nutrition table display
✅ Calorie intake graph
✅ Backend-driven progress bar
✅ Automatic data refresh
✅ Secure user isolation

---

**Need Help?** Check the Supabase logs in the dashboard for any errors.
