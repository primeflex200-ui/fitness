-- Add trainer_name column to trainer_videos table
ALTER TABLE public.trainer_videos 
ADD COLUMN IF NOT EXISTS trainer_name TEXT;