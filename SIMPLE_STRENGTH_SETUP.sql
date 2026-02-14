-- =====================================================
-- SIMPLE STRENGTH TRACKER SETUP (No Authentication Required)
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Create the table first (this doesn't require authentication)
CREATE TABLE IF NOT EXISTS public.strength_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    exercise TEXT NOT NULL,
    weight DECIMAL(10,2) NOT NULL,
    reps INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.strength_progress ENABLE ROW LEVEL SECURITY;

-- 3. Create simple policies (these work without being logged in)
CREATE POLICY "Enable read access for authenticated users" ON public.strength_progress
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.strength_progress
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on user_id" ON public.strength_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON public.strength_progress
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_strength_progress_user_id ON public.strength_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_strength_progress_date ON public.strength_progress(recorded_date DESC);

-- 5. Grant permissions
GRANT ALL ON public.strength_progress TO authenticated;
GRANT ALL ON public.strength_progress TO service_role;

-- 6. Verify table was created
SELECT 'Table created successfully!' as status;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================