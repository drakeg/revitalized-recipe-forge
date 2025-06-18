
-- Create ratings table
CREATE TABLE public.recipe_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(recipe_id, user_id) -- Prevent duplicate ratings from same user
);

-- Enable Row Level Security
ALTER TABLE public.recipe_ratings ENABLE ROW LEVEL SECURITY;

-- Users can view all ratings (public)
CREATE POLICY "Anyone can view ratings"
ON public.recipe_ratings FOR SELECT
USING (true);

-- Users can insert their own ratings
CREATE POLICY "Users can create their own ratings"
ON public.recipe_ratings FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own ratings
CREATE POLICY "Users can update their own ratings"
ON public.recipe_ratings FOR UPDATE
USING (user_id = auth.uid());

-- Users can delete their own ratings
CREATE POLICY "Users can delete their own ratings"
ON public.recipe_ratings FOR DELETE
USING (user_id = auth.uid());

-- Create function to calculate average rating for a recipe
CREATE OR REPLACE FUNCTION public.get_recipe_rating_stats(recipe_id_param UUID)
RETURNS TABLE (
  average_rating NUMERIC,
  total_ratings INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(AVG(rating::NUMERIC), 2) as average_rating,
    COUNT(*)::INTEGER as total_ratings
  FROM public.recipe_ratings 
  WHERE recipe_id = recipe_id_param;
END;
$$ LANGUAGE plpgsql STABLE;
