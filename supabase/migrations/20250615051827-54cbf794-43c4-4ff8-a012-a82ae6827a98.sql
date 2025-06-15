
-- 1. Add an is_paid column to profiles, defaulting to false for all users
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_paid boolean NOT NULL DEFAULT false;

-- 2. Mark greg@drakeweb.org as a paid subscriber
UPDATE public.profiles
SET is_paid = true
WHERE username = 'greg@drakeweb.org';
