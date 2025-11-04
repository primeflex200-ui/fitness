-- Create storage bucket for trainer videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trainer-videos',
  'trainer-videos',
  true,
  524288000, -- 500MB limit
  ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
);

-- Create RLS policies for video uploads
CREATE POLICY "Allow admins to upload videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'trainer-videos' 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Allow public to view videos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'trainer-videos');

CREATE POLICY "Allow admins to delete videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'trainer-videos'
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);