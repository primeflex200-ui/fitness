-- Create weekly_schedules table
CREATE TABLE IF NOT EXISTS public.weekly_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  schedule JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.weekly_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own schedule"
  ON public.weekly_schedules
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own schedule"
  ON public.weekly_schedules
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedule"
  ON public.weekly_schedules
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedule"
  ON public.weekly_schedules
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_weekly_schedules_user_id ON public.weekly_schedules(user_id);

-- Add comment
COMMENT ON TABLE public.weekly_schedules IS 'Stores user-customized weekly workout schedules';
