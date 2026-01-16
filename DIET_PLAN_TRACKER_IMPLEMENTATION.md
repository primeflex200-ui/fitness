# Diet Plan Tracker with Graph Integration - Implementation Guide

## Overview
Complete implementation of AI-generated diet plan integration with the main diet plan interface, including a working graph that updates in real-time when users tick food items.

## Features Implemented

### 1. **Diet Plan Tracker Page** (`/diet-plan-tracker`)
- Displays AI-generated diet plans
- Day-by-day meal tracking with checkboxes
- Real-time graph updates
- Weekly progress visualization
- Macro tracking (Protein, Carbs, Fats)

### 2. **Database Setup**

#### Create `meal_completions` Table
Run this SQL in Supabase SQL Editor:

```sql
-- Create meal_completions table
CREATE TABLE IF NOT EXISTS meal_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  meal_name TEXT NOT NULL,
  food_name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein DECIMAL(10,2) NOT NULL,
  carbs DECIMAL(10,2) NOT NULL,
  fats DECIMAL(10,2) NOT NULL,
  completed BOOLEAN DEFAULT false,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, day, meal_name, completion_date)
);

-- Create indexes
CREATE INDEX idx_meal_completions_user_date ON meal_completions(user_id, completion_date);
CREATE INDEX idx_meal_completions_user_day ON meal_completions(user_id, day);

-- Enable RLS
ALTER TABLE meal_completions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own meal completions"
  ON meal_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal completions"
  ON meal_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal completions"
  ON meal_completions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal completions"
  ON meal_completions FOR DELETE
  USING (auth.uid() = user_id);
```

#### Update `diet_plans` Table
Ensure your diet_plans table has these columns:

```sql
-- Check if diet_plans table exists and has correct structure
ALTER TABLE diet_plans ADD COLUMN IF NOT EXISTS diet_type TEXT;
ALTER TABLE diet_plans ADD COLUMN IF NOT EXISTS body_goal TEXT;
ALTER TABLE diet_plans ADD COLUMN IF NOT EXISTS plan_data JSONB;
```

### 3. **Update Supabase Types**

Add to `src/integrations/supabase/types.ts`:

```typescript
export interface MealCompletion {
  id: string;
  user_id: string;
  day: string;
  meal_name: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  completed: boolean;
  completion_date: string;
  created_at: string;
  updated_at: string;
}

export interface DietPlanRow {
  id: string;
  user_id: string;
  diet_type: string;
  body_goal: string;
  plan_data: any; // JSONB
  created_at: string;
  updated_at: string;
}
```

### 4. **User Flow**

```
1. User generates AI diet plan → /ai-diet-plan
2. Plan saved to database → diet_plans table
3. User navigates to tracker → /diet-plan-tracker
4. System loads saved plan
5. User ticks meals as completed
6. Graph updates in real-time
7. Progress saved to database
```

### 5. **Graph Features**

#### Weekly Progress Chart
- **X-Axis**: Days of the week (Mon-Sun)
- **Y-Axis**: Calories and Macros (grams)
- **Lines**:
  - 🟡 Consumed Calories (solid line)
  - ⚪ Target Calories (dashed line)
  - 🟢 Protein (grams)
  - 🔵 Carbs (grams)
  - 🟠 Fats (grams)

#### Real-Time Updates
- Checkbox tick → Immediate state update
- Graph recalculates automatically
- Database saves in background
- Toast notifications for feedback

### 6. **Daily Progress Card**

Shows for selected day:
- Consumed vs Target calories
- Current protein intake
- Current carbs intake
- Current fats intake
- Progress percentage bar

### 7. **Meal Cards**

Each meal displays:
- ✅ Checkbox for completion
- Meal name (Breakfast, Lunch, etc.)
- Food description
- Calorie count badge
- Macro breakdown (P/C/F)
- Green highlight when completed

## Setup Instructions

### Step 1: Run Database Migrations
```bash
# In Supabase SQL Editor, run:
# 1. create-meal-completions-table.sql
# 2. Update diet_plans table structure
```

### Step 2: Update TypeScript Types
```bash
# Add meal_completions to supabase types
# Update Database interface
```

### Step 3: Test the Flow
1. Generate a diet plan at `/ai-diet-plan`
2. Navigate to `/diet-plan-tracker`
3. Select a day
4. Tick meal checkboxes
5. Watch graph update in real-time

## Technical Details

### State Management
```typescript
const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
const [completedMeals, setCompletedMeals] = useState<Record<string, boolean>>({});
const [weeklyData, setWeeklyData] = useState<any[]>([]);
```

### Graph Calculation Logic
```typescript
const calculateDailyProgress = (day: string) => {
  // Sum calories from completed meals
  // Calculate macro totals
  // Return progress percentage
};

const calculateWeeklyProgress = () => {
  // Map all 7 days
  // Calculate progress for each
  // Format for chart display
};
```

### Database Operations
```typescript
// Load diet plan
const loadDietPlan = async () => {
  const { data } = await supabase
    .from("diet_plans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
};

// Save meal completion
const toggleMealCompletion = async (day, mealName, mealData) => {
  await supabase
    .from("meal_completions")
    .upsert({
      user_id: user.id,
      day,
      meal_name: mealName,
      calories: mealData.calories,
      protein: mealData.protein,
      carbs: mealData.carbs,
      fats: mealData.fats,
      completed: newStatus,
      completion_date: today
    });
};
```

## Benefits

### For Users
✅ **Visual Progress** - See nutrition intake at a glance
✅ **Real-Time Feedback** - Graph updates immediately
✅ **Daily Tracking** - Check off meals as you eat
✅ **Weekly Overview** - See patterns across the week
✅ **Macro Awareness** - Track protein, carbs, and fats

### For Developers
✅ **Clean Architecture** - Separated concerns
✅ **Type Safety** - Full TypeScript support
✅ **Database Integration** - Proper RLS policies
✅ **Reusable Components** - Chart library integration
✅ **Error Handling** - Graceful fallbacks

## Troubleshooting

### Graph Not Updating
- Check if `calculateWeeklyProgress()` is called after state changes
- Verify `useEffect` dependencies include `completedMeals`
- Ensure chart data format matches Recharts requirements

### Database Errors
- Verify RLS policies are enabled
- Check user authentication
- Ensure table structure matches types
- Run migrations in correct order

### TypeScript Errors
- Update supabase types file
- Add meal_completions to Database interface
- Cast JSONB data appropriately

## Next Steps

1. ✅ Create database tables
2. ✅ Implement tracker page
3. ✅ Add graph visualization
4. ✅ Connect to AI diet plan
5. 🔄 Test with real data
6. 🔄 Add mobile responsiveness
7. 🔄 Implement export feature

## Summary

The Diet Plan Tracker provides a complete solution for:
- Displaying AI-generated diet plans
- Tracking meal completions with checkboxes
- Visualizing progress with interactive graphs
- Saving data to database with proper RLS
- Real-time updates without page refresh

**Status**: Implementation complete, ready for database setup and testing.

---

**Created**: December 4, 2025
**Route**: `/diet-plan-tracker`
**Dependencies**: Recharts, Supabase, React
