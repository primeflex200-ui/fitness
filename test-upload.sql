-- TEST INSERT FOR TRAINER_VIDEOS
-- Run this after the RLS fix to test if inserts work

-- Test insert (this should work after RLS is disabled)
INSERT INTO public.trainer_videos (
  title, 
  description, 
  video_url, 
  thumbnail_url, 
  duration
) VALUES (
  'Test Video Upload',
  'This is a test to verify upload works',
  'https://test.com/video.mp4',
  'https://test.com/thumbnail.jpg',
  300
);

-- Verify the insert worked
SELECT * FROM public.trainer_videos WHERE title = 'Test Video Upload';

-- Clean up the test record
DELETE FROM public.trainer_videos WHERE title = 'Test Video Upload';
