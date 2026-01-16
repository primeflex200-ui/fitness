-- Run this in Supabase SQL Editor to check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'meal_completions'
);

-- If it returns FALSE, run create-meal-completions-table.sql first!

-- Also check if you have any data:
SELECT COUNT(*) as total_meals FROM meal_completions;

-- Check today's data:
SELECT * FROM meal_completions 
WHERE completion_date = CURRENT_DATE
ORDER BY created_at DESC
LIMIT 10;
