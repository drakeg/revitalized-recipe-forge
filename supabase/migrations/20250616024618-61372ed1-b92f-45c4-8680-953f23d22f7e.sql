
-- Update storage policies to be more secure
-- First, drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to upload recipe files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to recipe files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own recipe files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own recipe files" ON storage.objects;

-- Create more secure policies for file uploads

-- Policy: Allow anyone (authenticated or anonymous) to upload files to recipe-files bucket
CREATE POLICY "Allow file uploads to recipe-files bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'recipe-files');

-- Policy: Allow public read access to recipe files (needed for AI analysis)
CREATE POLICY "Allow public read access to recipe files"
ON storage.objects FOR SELECT
USING (bucket_id = 'recipe-files');

-- Policy: Allow users to update only their own files (authenticated users only)
CREATE POLICY "Allow users to update their own recipe files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'recipe-files' 
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow users to delete only their own files (authenticated users only)
CREATE POLICY "Allow users to delete their own recipe files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'recipe-files' 
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Drop and recreate RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Drop and recreate RLS policies for recipes table
DROP POLICY IF EXISTS "Users can view their recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can create their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can update their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can delete their own recipes" ON public.recipes;

CREATE POLICY "Users can view their recipes"
ON public.recipes FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own recipes"
ON public.recipes FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own recipes"
ON public.recipes FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own recipes"
ON public.recipes FOR DELETE
USING (user_id = auth.uid());
