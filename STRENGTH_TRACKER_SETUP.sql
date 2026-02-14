-- =====================================================
-- STRENGTH TRACKER DATABASE SETUP
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Create strength_progress table
CREATE TABLE IF NOT EXISTS public.strength_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    exercise TEXT NOT NULL,
    weight DECIMAL(10,2) NOT NULL CHECK (weight > 0),
    reps INTEGER NOT NULL CHECK (reps > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.strength_progress ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own strength progress" ON public.strength_progress;
DROP POLICY IF EXISTS "Users can insert own strength progress" ON public.strength_progress;
DROP POLICY IF EXISTS "Users can update own strength progress" ON public.strength_progress;
DROP POLICY IF EXISTS "Users can delete own strength progress" ON public.strength_progress;

-- 4. Create RLS policies
CREATE POLICY "Users can view own strength progress" ON public.strength_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own strength progress" ON public.strength_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own strength progress" ON public.strength_progress
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own strength progress" ON public.strength_progress
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_strength_progress_user_id ON public.strength_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_strength_progress_date ON public.strength_progress(recorded_date DESC);
CREATE INDEX IF NOT EXISTS idx_strength_progress_exercise ON public.strength_progress(exercise);
CREATE INDEX IF NOT EXISTS idx_strength_progress_user_date ON public.strength_progress(user_id, recorded_date DESC);

-- 6. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for updated_at
DROP TRIGGER IF EXISTS handle_strength_progress_updated_at ON public.strength_progress;
CREATE TRIGGER handle_strength_progress_updated_at
    BEFORE UPDATE ON public.strength_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 8. Insert some sample data for testing (optional - remove if not needed)
-- This will only insert if the table is empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.strength_progress LIMIT 1) THEN
        -- You can uncomment and modify this section to add sample data
        -- INSERT INTO public.strength_progress (user_id, exercise, weight, reps, recorded_date)
        -- VALUES 
        --     (auth.uid(), 'Bench Press', 135.0, 10, CURRENT_DATE - INTERVAL '1 day'),
        --     (auth.uid(), 'Squat', 185.0, 8, CURRENT_DATE - INTERVAL '1 day'),
        --     (auth.uid(), 'Deadlift', 225.0, 5, CURRENT_DATE);
        NULL;
    END IF;
END $$;

-- 9. Grant necessary permissions
GRANT ALL ON public.strength_progress TO authenticated;
GRANT ALL ON public.strength_progress TO service_role;

-- 10. Verify the setup
SELECT 
    'Table created successfully' as status,
    COUNT(*) as total_records
FROM public.strength_progress;

-- 11. Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'strength_progress' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- SETUP COMPLETE!
-- Your Strength Tracker should now work properly.
-- =====================================================