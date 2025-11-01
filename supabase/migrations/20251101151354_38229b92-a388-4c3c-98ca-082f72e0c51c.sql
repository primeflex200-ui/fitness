-- Add profile fields for age, gender, height, weight, and fitness goal
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS height NUMERIC(5,2), -- in cm
ADD COLUMN IF NOT EXISTS weight NUMERIC(5,2), -- in kg
ADD COLUMN IF NOT EXISTS fitness_goal TEXT CHECK (fitness_goal IN ('fat_loss', 'muscle_gain', 'maintain', 'athletic'));

-- Create workout completion tracking table
CREATE TABLE IF NOT EXISTS public.workout_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
  workout_type TEXT NOT NULL, -- 'push', 'pull', 'legs', 'cardio', 'home', 'calisthenics'
  exercise_name TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, workout_date, exercise_name)
);

-- Create diet completion tracking table
CREATE TABLE IF NOT EXISTS public.diet_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
  diet_plan TEXT NOT NULL, -- 'fatloss', 'lean', 'bulk', 'athletic'
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, meal_date, meal_type, diet_plan)
);

-- Create strength progress table for graph data
CREATE TABLE IF NOT EXISTS public.strength_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  weight NUMERIC(6,2) NOT NULL,
  reps INTEGER NOT NULL,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workout_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strength_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workout_completions
CREATE POLICY "Users can view their own workout completions"
ON public.workout_completions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout completions"
ON public.workout_completions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout completions"
ON public.workout_completions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout completions"
ON public.workout_completions FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for diet_completions
CREATE POLICY "Users can view their own diet completions"
ON public.diet_completions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own diet completions"
ON public.diet_completions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diet completions"
ON public.diet_completions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diet completions"
ON public.diet_completions FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for strength_progress
CREATE POLICY "Users can view their own strength progress"
ON public.strength_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own strength progress"
ON public.strength_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own strength progress"
ON public.strength_progress FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own strength progress"
ON public.strength_progress FOR DELETE
USING (auth.uid() = user_id);