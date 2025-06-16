
-- First, let's check if the profile exists and fix it
-- Insert or update the profile for the authenticated user to ensure they are marked as paid
INSERT INTO public.profiles (id, username, is_paid)
SELECT 
    auth.uid(),
    auth.email(),
    true
FROM auth.users
WHERE auth.uid() IS NOT NULL
ON CONFLICT (id) 
DO UPDATE SET 
    is_paid = true,
    username = COALESCE(profiles.username, auth.email());

-- Also ensure that any existing profile with your specific email is marked as paid
UPDATE public.profiles 
SET is_paid = true 
WHERE username = 'greg@drakeweb.org' OR id IN (
    SELECT id FROM auth.users WHERE email = 'greg@drakeweb.org'
);

-- Let's also check what's in the profiles table (for debugging)
SELECT id, username, is_paid, created_at FROM public.profiles;
