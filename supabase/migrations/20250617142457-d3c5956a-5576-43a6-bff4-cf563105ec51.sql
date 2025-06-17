
-- Add additional profile fields for a more complete user profile
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS phone text;

-- Create a policy for users to insert their own profile if it doesn't exist
-- First check if the policy exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
      ON public.profiles
      FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END$$;
