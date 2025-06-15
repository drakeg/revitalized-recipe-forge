
-- Set is_paid = true for the user with username 'greg@drakeweb.org'
UPDATE public.profiles
SET is_paid = true
WHERE username = 'greg@drakeweb.org';

-- Optionally, confirm the update:
SELECT id, username, is_paid FROM public.profiles WHERE username = 'greg@drakeweb.org';
