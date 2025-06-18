
-- Enable RLS on tables that don't have it enabled yet (using IF NOT EXISTS where possible)
DO $$ 
BEGIN
    -- Enable RLS on tables if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'meal_plans' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'meal_plan_items' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'recipes' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'recipe_categories' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.recipe_categories ENABLE ROW LEVEL SECURITY;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'recipe_category_assignments' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.recipe_category_assignments ENABLE ROW LEVEL SECURITY;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'shopping_lists' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'shopping_list_items' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'recipe_ratings' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.recipe_ratings ENABLE ROW LEVEL SECURITY;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'subscribers' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create RLS policies only if they don't exist
DO $$ 
BEGIN
    -- Recipes policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'recipes' AND policyname = 'Users can view their recipes'
    ) THEN
        CREATE POLICY "Users can view their recipes" ON public.recipes
        FOR SELECT USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'recipes' AND policyname = 'Users can create their own recipes'
    ) THEN
        CREATE POLICY "Users can create their own recipes" ON public.recipes
        FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'recipes' AND policyname = 'Users can update their own recipes'
    ) THEN
        CREATE POLICY "Users can update their own recipes" ON public.recipes
        FOR UPDATE USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'recipes' AND policyname = 'Users can delete their own recipes'
    ) THEN
        CREATE POLICY "Users can delete their own recipes" ON public.recipes
        FOR DELETE USING (user_id = auth.uid());
    END IF;

    -- Meal plans policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'meal_plans' AND policyname = 'Users can manage their own meal plans'
    ) THEN
        CREATE POLICY "Users can manage their own meal plans" ON public.meal_plans
        FOR ALL USING (user_id = auth.uid());
    END IF;

    -- Meal plan items policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'meal_plan_items' AND policyname = 'Users can manage their meal plan items'
    ) THEN
        CREATE POLICY "Users can manage their meal plan items" ON public.meal_plan_items
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.meal_plans 
            WHERE id = meal_plan_id AND user_id = auth.uid()
          )
        );
    END IF;

    -- Shopping lists policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'shopping_lists' AND policyname = 'Users can manage their own shopping lists'
    ) THEN
        CREATE POLICY "Users can manage their own shopping lists" ON public.shopping_lists
        FOR ALL USING (user_id = auth.uid());
    END IF;

    -- Shopping list items policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'shopping_list_items' AND policyname = 'Users can manage their shopping list items'
    ) THEN
        CREATE POLICY "Users can manage their shopping list items" ON public.shopping_list_items
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.shopping_lists 
            WHERE id = shopping_list_id AND user_id = auth.uid()
          )
        );
    END IF;

    -- Recipe categories policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'recipe_categories' AND policyname = 'Anyone can view categories'
    ) THEN
        CREATE POLICY "Anyone can view categories" ON public.recipe_categories
        FOR SELECT USING (true);
    END IF;

    -- Recipe category assignments policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'recipe_category_assignments' AND policyname = 'Users can manage their recipe categories'
    ) THEN
        CREATE POLICY "Users can manage their recipe categories" ON public.recipe_category_assignments
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.recipes 
            WHERE id = recipe_id AND user_id = auth.uid()
          )
        );
    END IF;

    -- Recipe ratings policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'recipe_ratings' AND policyname = 'Users can view recipe ratings'
    ) THEN
        CREATE POLICY "Users can view recipe ratings" ON public.recipe_ratings
        FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'recipe_ratings' AND policyname = 'Users can manage their own ratings'
    ) THEN
        CREATE POLICY "Users can manage their own ratings" ON public.recipe_ratings
        FOR ALL USING (user_id = auth.uid());
    END IF;

    -- Subscribers policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subscribers' AND policyname = 'Users can view their own subscription'
    ) THEN
        CREATE POLICY "Users can view their own subscription" ON public.subscribers
        FOR SELECT USING (user_id = auth.uid() OR email = auth.email());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subscribers' AND policyname = 'Service can manage subscriptions'
    ) THEN
        CREATE POLICY "Service can manage subscriptions" ON public.subscribers
        FOR ALL USING (true);
    END IF;

END $$;
