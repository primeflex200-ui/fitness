-- Create strength_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.strength_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL,
    exercise TEXT,
    weight DECIMAL(10,2),
    reps INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.strength_progress ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own data
CREATE POLICY "Users can view own strength progress" ON public.strength_progress
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own data
CREATE POLICY "Users can insert own strength progress" ON public.strength_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own data
CREATE POLICY "Users can update own strength progress" ON public.strength_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own data
CREATE POLICY "Users can delete own strength progress" ON public.strength_progress
    FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_strength_progress_user_id ON public.strength_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_strength_progress_date ON public.strength_progress(recorded_date);