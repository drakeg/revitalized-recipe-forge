import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting implementation
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 900000, maxRequests: number = 10) { // 15 minutes, 10 requests
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(key: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      this.store.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs
      };
    }

    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }

    entry.count++;
    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }
}

const rateLimiter = new RateLimiter(900000, 10); // 10 requests per 15 minutes

function getClientId(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  
  return forwarded?.split(',')[0] || realIP || cfConnectingIP || 'unknown';
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('[CHECK-SUBSCRIPTION] CORS preflight request received');
    return new Response(null, { headers: corsHeaders });
  }

  console.log('[CHECK-SUBSCRIPTION] Function started');
  
  // Rate limiting check
  const clientId = getClientId(req);
  const { allowed, remaining, resetTime } = rateLimiter.isAllowed(clientId);
  
  if (!allowed) {
    const waitTime = Math.ceil((resetTime - Date.now()) / 1000);
    console.log(`[CHECK-SUBSCRIPTION] Rate limit exceeded for ${clientId}`);
    return new Response(JSON.stringify({ 
      error: `Too many subscription checks. Try again in ${waitTime} seconds.`,
      retryAfter: waitTime
    }), {
      status: 429,
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json",
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": resetTime.toString(),
        "Retry-After": waitTime.toString()
      },
    });
  }

  try {
    console.log('[CHECK-SUBSCRIPTION] Request details', {
      method: req.method,
      url: req.url,
      userAgent: req.headers.get('user-agent'),
      origin: req.headers.get('origin')
    });

    // Environment variables check
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log('[CHECK-SUBSCRIPTION] Environment variables status', {
      stripeKey: stripeKey ? `Set (${stripeKey.length} chars)` : "Missing",
      supabaseUrl: supabaseUrl ? "Set" : "Missing",
      supabaseServiceKey: supabaseServiceKey ? `Set (${supabaseServiceKey.length} chars)` : "Missing"
    });

    if (!stripeKey) {
      console.log('[CHECK-SUBSCRIPTION] ERROR: STRIPE_SECRET_KEY is not set');
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    console.log('[CHECK-SUBSCRIPTION] Stripe key verified');

    // Use service role key for database operations
    const supabaseClient = createClient(
      supabaseUrl ?? "",
      supabaseServiceKey ?? "",
      { auth: { persistSession: false } }
    );
    console.log('[CHECK-SUBSCRIPTION] Supabase client initialized with service role');

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log('[CHECK-SUBSCRIPTION] ERROR: No authorization header provided');
      throw new Error("No authorization header provided");
    }
    console.log('[CHECK-SUBSCRIPTION] Authorization header found', { 
      headerLength: authHeader.length,
      startsWithBearer: authHeader.startsWith("Bearer ")
    });

    const token = authHeader.replace("Bearer ", "");
    console.log('[CHECK-SUBSCRIPTION] Authenticating user with token', { tokenLength: token.length });
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      console.log('[CHECK-SUBSCRIPTION] ERROR: Authentication failed', { 
        error: userError.message,
        code: userError.status,
        details: userError
      });
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user?.email) {
      console.log('[CHECK-SUBSCRIPTION] ERROR: User not authenticated or email not available', {
        hasUser: !!user,
        userEmail: user?.email || "No email"
      });
      throw new Error("User not authenticated or email not available");
    }
    console.log('[CHECK-SUBSCRIPTION] User authenticated', { userId: user.id, email: user.email });

    // First, check if this user has been manually granted premium access in the database
    console.log('[CHECK-SUBSCRIPTION] Checking local database for manual premium access');
    const { data: localSubscribers, error: localError } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("email", user.email);

    console.log('[CHECK-SUBSCRIPTION] Local database query result', {
      error: localError?.message,
      subscribersFound: localSubscribers?.length || 0,
      subscribers: localSubscribers
    });

    // Check if we found a subscribed user in local database
    const localSubscriber = localSubscribers?.find(sub => sub.subscribed);
    if (localSubscriber) {
      console.log('[CHECK-SUBSCRIPTION] Found manual premium access in database', {
        subscribed: localSubscriber.subscribed,
        subscriptionTier: localSubscriber.subscription_tier,
        subscriptionEnd: localSubscriber.subscription_end
      });

      // Also update the profiles table to ensure consistency
      const profileUpdate = await supabaseClient.from("profiles").update({
        is_paid: true
      }).eq("id", user.id);

      console.log('[CHECK-SUBSCRIPTION] Profile table update', { 
        error: profileUpdate.error?.message,
        success: !profileUpdate.error
      });

      return new Response(JSON.stringify({
        subscribed: true,
        subscription_tier: localSubscriber.subscription_tier,
        subscription_end: localSubscriber.subscription_end
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // If no manual access found, proceed with Stripe check
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    console.log('[CHECK-SUBSCRIPTION] Stripe client initialized', { apiVersion: "2023-10-16" });
    
    console.log('[CHECK-SUBSCRIPTION] Looking up Stripe customer', { email: user.email });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    console.log('[CHECK-SUBSCRIPTION] Customer lookup completed', { 
      customersFound: customers.data.length,
      hasMore: customers.has_more
    });
    
    if (customers.data.length === 0) {
      console.log('[CHECK-SUBSCRIPTION] No customer found, updating unsubscribed state');
      
      // Update both subscribers and profiles tables
      const subscriberUpsert = await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: null,
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });

      console.log('[CHECK-SUBSCRIPTION] Subscriber table update', { 
        error: subscriberUpsert.error?.message,
        success: !subscriberUpsert.error
      });

      const profileUpdate = await supabaseClient.from("profiles").update({
        is_paid: false
      }).eq("id", user.id);

      console.log('[CHECK-SUBSCRIPTION] Profile table update', { 
        error: profileUpdate.error?.message,
        success: !profileUpdate.error
      });

      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    console.log('[CHECK-SUBSCRIPTION] Found Stripe customer', { 
      customerId,
      customerCreated: customers.data[0].created,
      customerName: customers.data[0].name
    });

    console.log('[CHECK-SUBSCRIPTION] Looking up active subscriptions');
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = null;
    let subscriptionEnd = null;

    console.log('[CHECK-SUBSCRIPTION] Subscription lookup completed', {
      activeSubscriptions: subscriptions.data.length,
      hasActiveSub
    });

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      console.log('[CHECK-SUBSCRIPTION] Active subscription found', { 
        subscriptionId: subscription.id,
        status: subscription.status,
        endDate: subscriptionEnd,
        itemsCount: subscription.items.data.length
      });
      
      // Determine subscription tier from price
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      
      if (amount <= 999) {
        subscriptionTier = "Premium";
      } else if (amount <= 1999) {
        subscriptionTier = "Pro";
      } else {
        subscriptionTier = "Enterprise";
      }
      
      console.log('[CHECK-SUBSCRIPTION] Determined subscription tier', { 
        priceId,
        amount,
        subscriptionTier,
        currency: price.currency
      });
    } else {
      console.log('[CHECK-SUBSCRIPTION] No active subscription found');
    }

    // Update both subscribers and profiles tables
    console.log('[CHECK-SUBSCRIPTION] Updating database with subscription info');
    
    const subscriberUpsert = await supabaseClient.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    console.log('[CHECK-SUBSCRIPTION] Subscriber table upsert', { 
      error: subscriberUpsert.error?.message,
      success: !subscriberUpsert.error
    });

    const profileUpdate = await supabaseClient.from("profiles").update({
      is_paid: hasActiveSub
    }).eq("id", user.id);

    console.log('[CHECK-SUBSCRIPTION] Profile table update', { 
      error: profileUpdate.error?.message,
      success: !profileUpdate.error
    });

    const responseData = {
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd
    };

    console.log('[CHECK-SUBSCRIPTION] Function completed successfully', responseData);
    
    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error('[CHECK-SUBSCRIPTION] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
