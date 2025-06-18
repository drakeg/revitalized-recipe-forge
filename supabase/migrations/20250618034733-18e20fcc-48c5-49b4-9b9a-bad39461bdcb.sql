
-- Fix the search_path security issue for get_recipe_rating_stats function
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
$$ LANGUAGE plpgsql 
STABLE 
SECURITY DEFINER
SET search_path = public;
