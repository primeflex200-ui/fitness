-- =====================================================
-- BASIC TABLE CREATION ONLY
-- Run this first, then add policies later
-- =====================================================

-- Just create the basic table structure
CREATE TABLE IF NOT EXISTS public.strength_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    recorded_date DATE DEFAULT CURRENT_DATE,
    exercise TEXT,
    weight DECIMAL(10,2),
    reps INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Check if table was created
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'strength_progress' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- If this works, then run the RLS setup separately
-- =====================================================