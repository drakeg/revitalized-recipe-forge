
-- Add the missing source_url column to the recipes table
ALTER TABLE public.recipes 
ADD COLUMN source_url TEXT;
