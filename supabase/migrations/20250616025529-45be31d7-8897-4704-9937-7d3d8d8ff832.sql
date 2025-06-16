
-- Add categories/tags support
CREATE TABLE public.recipe_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#10b981',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Junction table for recipe-category relationships (many-to-many)
CREATE TABLE public.recipe_category_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.recipe_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(recipe_id, category_id)
);

-- Meal plans table
CREATE TABLE public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Meal plan items (individual meals in a plan)
CREATE TABLE public.meal_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  meal_date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  servings INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shopping lists table
CREATE TABLE public.shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  meal_plan_id UUID REFERENCES public.meal_plans(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shopping list items
CREATE TABLE public.shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  ingredient TEXT NOT NULL,
  quantity TEXT,
  unit TEXT,
  checked BOOLEAN DEFAULT false,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.recipe_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_category_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recipe_categories (public read, admin write)
CREATE POLICY "Anyone can view categories" ON public.recipe_categories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create categories" ON public.recipe_categories FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for recipe_category_assignments
CREATE POLICY "Users can view category assignments for their recipes" ON public.recipe_category_assignments 
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.recipes 
    WHERE recipes.id = recipe_category_assignments.recipe_id 
    AND recipes.user_id = auth.uid()
  )
);
CREATE POLICY "Users can assign categories to their recipes" ON public.recipe_category_assignments 
FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.recipes 
    WHERE recipes.id = recipe_category_assignments.recipe_id 
    AND recipes.user_id = auth.uid()
  )
);
CREATE POLICY "Users can remove categories from their recipes" ON public.recipe_category_assignments 
FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.recipes 
    WHERE recipes.id = recipe_category_assignments.recipe_id 
    AND recipes.user_id = auth.uid()
  )
);

-- RLS Policies for meal_plans
CREATE POLICY "Users can view their meal plans" ON public.meal_plans FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create their meal plans" ON public.meal_plans FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their meal plans" ON public.meal_plans FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete their meal plans" ON public.meal_plans FOR DELETE TO authenticated USING (user_id = auth.uid());

-- RLS Policies for meal_plan_items
CREATE POLICY "Users can view their meal plan items" ON public.meal_plan_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.meal_plans WHERE meal_plans.id = meal_plan_items.meal_plan_id AND meal_plans.user_id = auth.uid())
);
CREATE POLICY "Users can create their meal plan items" ON public.meal_plan_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.meal_plans WHERE meal_plans.id = meal_plan_items.meal_plan_id AND meal_plans.user_id = auth.uid())
);
CREATE POLICY "Users can update their meal plan items" ON public.meal_plan_items FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.meal_plans WHERE meal_plans.id = meal_plan_items.meal_plan_id AND meal_plans.user_id = auth.uid())
);
CREATE POLICY "Users can delete their meal plan items" ON public.meal_plan_items FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.meal_plans WHERE meal_plans.id = meal_plan_items.meal_plan_id AND meal_plans.user_id = auth.uid())
);

-- RLS Policies for shopping_lists
CREATE POLICY "Users can view their shopping lists" ON public.shopping_lists FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create their shopping lists" ON public.shopping_lists FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their shopping lists" ON public.shopping_lists FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete their shopping lists" ON public.shopping_lists FOR DELETE TO authenticated USING (user_id = auth.uid());

-- RLS Policies for shopping_list_items
CREATE POLICY "Users can view their shopping list items" ON public.shopping_list_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.shopping_lists WHERE shopping_lists.id = shopping_list_items.shopping_list_id AND shopping_lists.user_id = auth.uid())
);
CREATE POLICY "Users can create their shopping list items" ON public.shopping_list_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.shopping_lists WHERE shopping_lists.id = shopping_list_items.shopping_list_id AND shopping_lists.user_id = auth.uid())
);
CREATE POLICY "Users can update their shopping list items" ON public.shopping_list_items FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.shopping_lists WHERE shopping_lists.id = shopping_list_items.shopping_list_id AND shopping_lists.user_id = auth.uid())
);
CREATE POLICY "Users can delete their shopping list items" ON public.shopping_list_items FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.shopping_lists WHERE shopping_lists.id = shopping_list_items.shopping_list_id AND shopping_lists.user_id = auth.uid())
);

-- Insert some default categories
INSERT INTO public.recipe_categories (name, color) VALUES
  ('Breakfast', '#f59e0b'),
  ('Lunch', '#10b981'),
  ('Dinner', '#3b82f6'),
  ('Dessert', '#ec4899'),
  ('Snack', '#8b5cf6'),
  ('Vegetarian', '#22c55e'),
  ('Vegan', '#16a34a'),
  ('Gluten-Free', '#eab308'),
  ('Quick & Easy', '#f97316'),
  ('Healthy', '#06b6d4');
