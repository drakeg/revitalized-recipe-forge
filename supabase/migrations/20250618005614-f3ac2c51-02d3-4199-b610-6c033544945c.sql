
-- Update the existing subscriber record for greg@drakeweb.org to be subscribed
UPDATE public.subscribers 
SET 
    subscribed = true,
    subscription_tier = 'Premium',
    updated_at = now()
WHERE email = 'greg@drakeweb.org';

-- Verify the update worked
SELECT email, subscribed, subscription_tier, subscription_end 
FROM public.subscribers 
WHERE email = 'greg@drakeweb.org';
