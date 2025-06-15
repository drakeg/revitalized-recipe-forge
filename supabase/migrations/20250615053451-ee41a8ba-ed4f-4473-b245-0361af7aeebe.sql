
-- Set the username to 'greg@drakeweb.org' and is_paid to true for the (only) user in profiles table
UPDATE public.profiles
SET username = 'greg@drakeweb.org', is_paid = true
WHERE username IS NULL OR username = '';
