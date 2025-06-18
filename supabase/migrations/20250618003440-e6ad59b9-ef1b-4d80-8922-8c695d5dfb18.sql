
-- First, let's check the current status for greg@drakeweb.org
SELECT 
    p.id as profile_id,
    p.username,
    p.is_paid,
    s.email,
    s.subscribed,
    s.subscription_tier,
    s.subscription_end,
    s.stripe_customer_id
FROM public.profiles p
LEFT JOIN public.subscribers s ON p.id = s.user_id
WHERE p.username = 'greg@drakeweb.org' 
   OR s.email = 'greg@drakeweb.org'
   OR p.id IN (SELECT id FROM auth.users WHERE email = 'greg@drakeweb.org');

-- Update the profiles table to ensure is_paid = true for greg@drakeweb.org
UPDATE public.profiles 
SET is_paid = true 
WHERE username = 'greg@drakeweb.org' 
   OR id IN (SELECT id FROM auth.users WHERE email = 'greg@drakeweb.org');

-- Update or insert into subscribers table to ensure subscribed = true for greg@drakeweb.org
INSERT INTO public.subscribers (
    user_id, 
    email, 
    subscribed, 
    subscription_tier,
    updated_at
)
SELECT 
    u.id,
    u.email,
    true,
    'Premium',
    now()
FROM auth.users u
WHERE u.email = 'greg@drakeweb.org'
ON CONFLICT (email) 
DO UPDATE SET 
    subscribed = true,
    subscription_tier = 'Premium',
    updated_at = now();

-- Final verification query
SELECT 
    p.id as profile_id,
    p.username,
    p.is_paid,
    s.email,
    s.subscribed,
    s.subscription_tier,
    s.subscription_end,
    s.stripe_customer_id
FROM public.profiles p
LEFT JOIN public.subscribers s ON p.id = s.user_id
WHERE p.username = 'greg@drakeweb.org' 
   OR s.email = 'greg@drakeweb.org'
   OR p.id IN (SELECT id FROM auth.users WHERE email = 'greg@drakeweb.org');
