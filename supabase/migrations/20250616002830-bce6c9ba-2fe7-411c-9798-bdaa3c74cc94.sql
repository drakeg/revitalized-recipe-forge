
-- Create a storage bucket for recipe files
INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-files', 'recipe-files', true);

-- Create policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload recipe files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'recipe-files' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow users to view all recipe files (since bucket is public)
CREATE POLICY "Allow public access to recipe files"
ON storage.objects FOR SELECT
USING (bucket_id = 'recipe-files');

-- Create policy to allow users to update their own uploaded files
CREATE POLICY "Allow users to update their own recipe files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'recipe-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to delete their own uploaded files
CREATE POLICY "Allow users to delete their own recipe files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'recipe-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
