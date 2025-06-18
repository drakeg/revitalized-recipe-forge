
-- Create user preferences table for dietary restrictions and cooking preferences
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dietary_restrictions TEXT[], -- Array of dietary restrictions like 'vegetarian', 'gluten-free', etc.
  cooking_skill_level TEXT CHECK (cooking_skill_level IN ('beginner', 'intermediate', 'advanced')),
  preferred_cuisines TEXT[], -- Array of preferred cuisines
  cooking_time_preference TEXT CHECK (cooking_time_preference IN ('quick', 'medium', 'long')),
  allergens TEXT[], -- Array of allergens to avoid
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create recipe collections table
CREATE TABLE public.recipe_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_collaborative BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create recipe collection items table
CREATE TABLE public.recipe_collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.recipe_collections(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(collection_id, recipe_id)
);

-- Create recipe swap requests table
CREATE TABLE public.recipe_swap_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  offered_recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
  requested_recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create private messages table
CREATE TABLE public.private_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL, -- Optional recipe reference
  swap_request_id UUID REFERENCES public.recipe_swap_requests(id) ON DELETE SET NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create recipe gifts table
CREATE TABLE public.recipe_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  gift_message TEXT,
  is_opened BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create collaborative recipe contributors table
CREATE TABLE public.recipe_contributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contribution_type TEXT NOT NULL CHECK (contribution_type IN ('owner', 'collaborator', 'reviewer')),
  permissions TEXT[] NOT NULL DEFAULT ARRAY['view'], -- 'view', 'edit', 'manage'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(recipe_id, user_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_contributors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences"
ON public.user_preferences FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own preferences"
ON public.user_preferences FOR ALL
USING (user_id = auth.uid());

-- RLS Policies for recipe_collections
CREATE POLICY "Users can view public collections or their own"
ON public.recipe_collections FOR SELECT
USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can manage their own collections"
ON public.recipe_collections FOR ALL
USING (user_id = auth.uid());

-- RLS Policies for recipe_collection_items
CREATE POLICY "Users can view items in accessible collections"
ON public.recipe_collection_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.recipe_collections 
    WHERE id = collection_id 
    AND (is_public = true OR user_id = auth.uid() OR is_collaborative = true)
  )
);

CREATE POLICY "Users can manage items in their collections"
ON public.recipe_collection_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.recipe_collections 
    WHERE id = collection_id 
    AND user_id = auth.uid()
  )
);

-- RLS Policies for recipe_swap_requests
CREATE POLICY "Users can view their swap requests"
ON public.recipe_swap_requests FOR SELECT
USING (requester_id = auth.uid() OR target_user_id = auth.uid());

CREATE POLICY "Users can create swap requests"
ON public.recipe_swap_requests FOR INSERT
WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update swap requests they're involved in"
ON public.recipe_swap_requests FOR UPDATE
USING (requester_id = auth.uid() OR target_user_id = auth.uid());

-- RLS Policies for private_messages
CREATE POLICY "Users can view their messages"
ON public.private_messages FOR SELECT
USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages"
ON public.private_messages FOR INSERT
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update messages they received"
ON public.private_messages FOR UPDATE
USING (recipient_id = auth.uid());

-- RLS Policies for recipe_gifts
CREATE POLICY "Users can view their gifts"
ON public.recipe_gifts FOR SELECT
USING (giver_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send gifts"
ON public.recipe_gifts FOR INSERT
WITH CHECK (giver_id = auth.uid());

CREATE POLICY "Recipients can update gift status"
ON public.recipe_gifts FOR UPDATE
USING (recipient_id = auth.uid());

-- RLS Policies for recipe_contributors
CREATE POLICY "Users can view recipe contributors"
ON public.recipe_contributors FOR SELECT
USING (true); -- Public visibility for transparency

CREATE POLICY "Recipe owners can manage contributors"
ON public.recipe_contributors FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.recipes 
    WHERE id = recipe_id 
    AND user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_recipe_collections_user_id ON public.recipe_collections(user_id);
CREATE INDEX idx_recipe_collections_public ON public.recipe_collections(is_public) WHERE is_public = true;
CREATE INDEX idx_recipe_collection_items_collection_id ON public.recipe_collection_items(collection_id);
CREATE INDEX idx_recipe_swap_requests_requester ON public.recipe_swap_requests(requester_id);
CREATE INDEX idx_recipe_swap_requests_target ON public.recipe_swap_requests(target_user_id);
CREATE INDEX idx_private_messages_recipient ON public.private_messages(recipient_id);
CREATE INDEX idx_private_messages_sender ON public.private_messages(sender_id);
CREATE INDEX idx_recipe_gifts_recipient ON public.recipe_gifts(recipient_id);
CREATE INDEX idx_recipe_contributors_recipe ON public.recipe_contributors(recipe_id);
