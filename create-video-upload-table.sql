-- Create trainer_videos table with video and thumbnail support
CREATE TABLE IF NOT EXISTS trainer_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER, -- in seconds
  trainer_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE trainer_videos ENABLE ROW LEVEL SECURITY;

-- Create policy for trainers to manage their videos
CREATE POLICY "Trainers can manage their own videos" ON trainer_videos
  FOR ALL USING (
    auth.uid() = trainer_id OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create policy for public to view videos
CREATE POLICY "Videos are viewable by everyone" ON trainer_videos
  FOR SELECT USING (true);

-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for video storage
CREATE POLICY "Users can upload their own videos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own videos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policies for thumbnail storage
CREATE POLICY "Users can upload their own thumbnails" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'thumbnails' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own thumbnails" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'thumbnails' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create index for better performance
CREATE INDEX idx_trainer_videos_trainer_id ON trainer_videos(trainer_id);
CREATE INDEX idx_trainer_videos_created_at ON trainer_videos(created_at DESC);
