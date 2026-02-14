-- =====================================================
-- TEST STRENGTH TRACKER SETUP
-- Run this AFTER running STRENGTH_TRACKER_SETUP.sql
-- =====================================================

-- 1. Check if table exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'strength_progress' 
            AND table_schema = 'public'
        ) 
        THEN '✅ Table exists'
        ELSE '❌ Table missing'
    END as table_status;

-- 2. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'strength_progress';

-- 3. Test insert (this will only work if you're logged in)
-- Uncomment the lines below to test inserting data
/*
INSERT INTO public.strength_progress (user_id, exercise, weight, reps, recorded_date)
VALUES (auth.uid(), 'Test Exercise', 100.0, 10, CURRENT_DATE);

SELECT 'Insert test successful' as test_result;
*/

-- 4. Check current user
SELECT 
    CASE 
        WHEN auth.uid() IS NOT NULL 
        THEN '✅ User authenticated: ' || auth.uid()::text
        ELSE '❌ No user authenticated'
    END as auth_status;

-- 5. Count existing records
SELECT 
    COUNT(*) as total_records,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT exercise) as unique_exercises
FROM public.strength_progress;

-- 6. Show recent entries (if any)
SELECT 
    exercise,
    weight,
    reps,
    recorded_date,
    created_at
FROM public.strength_progress 
ORDER BY created_at DESC 
LIMIT 5;

-- =====================================================
-- If all checks pass, your Strength Tracker is ready!
-- =====================================================