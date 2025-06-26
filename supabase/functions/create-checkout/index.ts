
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
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

  constructor(windowMs: number = 900000, maxRequests: number = 3) { // 15 minutes, 3 requests
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

const rateLimiter = new RateLimiter(900000, 3); // 3 checkout attempts per 15 minutes

function getClientId(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  
  return forwarded?.split(',')[0] || realIP || cfConnectingIP || 'unknown';
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting check
  const clientId = getClientId(req);
  const { allowed, remaining, resetTime } = rateLimiter.isAllowed(clientId);
  
  if (!allowed) {
    const waitTime = Math.ceil((resetTime - Date.now()) / 1000);
    console.log(`[CREATE-CHECKOUT] Rate limit exceeded for ${clientId}`);
    return new Response(JSON.stringify({ 
      error: `Too many checkout attempts. Try again in ${waitTime} seconds.`,
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
    logStep("Function started");
    logStep("Request method", { method: req.method });
    logStep("Request headers", { 
      origin: req.headers.get("origin"),
      authorization: req.headers.get("Authorization") ? "Bearer [REDACTED]" : "No auth header",
      contentType: req.headers.get("content-type")
    });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY is not set");
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    logStep("Stripe key verified", { keyLength: stripeKey.length });

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    logStep("Environment variables check", {
      supabaseUrl: supabaseUrl ? "Set" : "Missing",
      supabaseAnonKey: supabaseAnonKey ? "Set" : "Missing"
    });

    const supabaseClient = createClient(
      supabaseUrl ?? "",
      supabaseAnonKey ?? ""
    );

    // Check if user is authenticated (optional for checkout)
    let user = null;
    let userEmail = null;
    
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      logStep("Authorization header found, attempting to authenticate user");
      const token = authHeader.replace("Bearer ", "");
      
      try {
        const { data, error: authError } = await supabaseClient.auth.getUser(token);
        if (!authError && data.user?.email) {
          user = data.user;
          userEmail = data.user.email;
          logStep("User authenticated", { userId: user.id, email: userEmail });
        } else {
          logStep("Authentication failed, proceeding as guest", { error: authError?.message });
        }
      } catch (error) {
        logStep("Authentication error, proceeding as guest", { error: error.message });
      }
    } else {
      logStep("No authorization header, proceeding as guest checkout");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    logStep("Stripe client initialized");
    
    // Check if customer already exists (only if we have a user email)
    let customerId;
    if (userEmail) {
      logStep("Looking up existing customer");
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing customer", { customerId });
      } else {
        logStep("No existing customer found");
      }
    }

    const origin = req.headers.get("origin") || "https://xvtfkjjvzjjwpgrwteem.supabase.co";
    logStep("Creating checkout session", { origin, customerId: customerId || "New customer", userEmail: userEmail || "Guest" });

    const sessionData = {
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: "Premium Meal Planning Subscription",
              description: "Access to advanced meal planning, shopping lists, and premium features"
            },
            unit_amount: 999, // $9.99
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/?subscription=success`,
      cancel_url: `${origin}/?subscription=cancelled`,
      metadata: {
        user_id: user?.id || "guest",
      },
      // For guests, collect email during checkout
      ...(userEmail ? {} : { 
        customer_creation: "always" as const,
        billing_address_collection: "required" as const 
      }),
    };

    logStep("Session data prepared", { 
      mode: sessionData.mode,
      lineItemsCount: sessionData.line_items.length,
      successUrl: sessionData.success_url,
      cancelUrl: sessionData.cancel_url,
      isGuest: !userEmail
    });

    const session = await stripe.checkout.sessions.create(sessionData);

    logStep("Checkout session created successfully", { 
      sessionId: session.id, 
      url: session.url,
      status: session.status
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": resetTime.toString()
      },
    });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    logStep("ERROR in create-checkout", { 
      message: errorMessage,
      stack: errorStack,
      type: error?.constructor?.name
    });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: "Check function logs for more information"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
