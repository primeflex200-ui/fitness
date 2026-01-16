-- Create diet-plans storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('diet-plans', 'diet-plans', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects for diet-plans bucket
CREATE POLICY "Users can view their own diet plans"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'diet-plans' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can upload their own diet plans"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'diet-plans' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own diet plans"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'diet-plans' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Create policy for authenticated users to list their diet plans
CREATE POLICY "Users can list their own diet plans"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'diet-plans' AND
    auth.role() = 'authenticated'
  );
