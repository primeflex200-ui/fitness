-- Create diet_plans table
CREATE TABLE IF NOT EXISTS diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id TEXT,
  plan_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_diet_plans_user_id ON diet_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_plans_created_at ON diet_plans(created_at DESC);

-- Enable RLS
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for users to see only their own diet plans
CREATE POLICY "Users can view their own diet plans"
  ON diet_plans
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create RLS policy for users to insert their own diet plans
CREATE POLICY "Users can insert their own diet plans"
  ON diet_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policy for users to update their own diet plans
CREATE POLICY "Users can update their own diet plans"
  ON diet_plans
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policy for users to delete their own diet plans
CREATE POLICY "Users can delete their own diet plans"
  ON diet_plans
  FOR DELETE
  USING (auth.uid() = user_id);
