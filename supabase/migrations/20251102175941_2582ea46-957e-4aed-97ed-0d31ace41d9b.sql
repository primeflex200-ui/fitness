-- Add diet_type column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN diet_type text CHECK (diet_type IN ('veg', 'non_veg', ''));

-- Add comment to explain the column
COMMENT ON COLUMN public.profiles.diet_type IS 'User dietary preference: veg (vegetarian) or non_veg (non-vegetarian)';