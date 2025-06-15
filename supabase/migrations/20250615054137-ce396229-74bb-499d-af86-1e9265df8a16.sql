
-- Create the recipes table to store each user's recipes
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  original_text TEXT NOT NULL,
  analysis TEXT, -- can store smart analysis result
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Policy: users can select their own recipes
CREATE POLICY "Users can view their recipes"
ON public.recipes FOR SELECT
USING (user_id = auth.uid());

-- Policy: users can insert their recipes
CREATE POLICY "Users can create their own recipes"
ON public.recipes FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Policy: users can update their own recipes
CREATE POLICY "Users can update their own recipes"
ON public.recipes FOR UPDATE
USING (user_id = auth.uid());

-- Policy: users can delete their own recipes
CREATE POLICY "Users can delete their own recipes"
ON public.recipes FOR DELETE
USING (user_id = auth.uid());
