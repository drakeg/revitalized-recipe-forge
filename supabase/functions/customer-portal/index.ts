
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    logStep("CORS preflight request received");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    logStep("Request details", {
      method: req.method,
      url: req.url,
      userAgent: req.headers.get("user-agent"),
      origin: req.headers.get("origin"),
      referer: req.headers.get("referer")
    });

    // Environment variables check
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    logStep("Environment variables status", {
      stripeKey: stripeKey ? `Set (${stripeKey.length} chars)` : "Missing",
      supabaseUrl: supabaseUrl ? "Set" : "Missing",
      supabaseServiceKey: supabaseServiceKey ? `Set (${supabaseServiceKey.length} chars)` : "Missing"
    });

    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY is not set");
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    logStep("Stripe key verified");

    const supabaseClient = createClient(
      supabaseUrl ?? "",
      supabaseServiceKey ?? "",
      { auth: { persistSession: false } }
    );
    logStep("Supabase client initialized with service role");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header provided");
      throw new Error("No authorization header provided");
    }
    logStep("Authorization header found", { 
      headerLength: authHeader.length,
      startsWithBearer: authHeader.startsWith("Bearer ")
    });

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token", { tokenLength: token.length });
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      logStep("ERROR: Authentication failed", { 
        error: userError.message,
        code: userError.status,
        details: userError
      });
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user?.email) {
      logStep("ERROR: User not authenticated or email not available", {
        hasUser: !!user,
        userEmail: user?.email || "No email"
      });
      throw new Error("User not authenticated or email not available");
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    logStep("Stripe client initialized", { apiVersion: "2023-10-16" });
    
    logStep("Looking up Stripe customer", { email: user.email });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    logStep("Customer lookup completed", { 
      customersFound: customers.data.length,
      hasMore: customers.has_more
    });
    
    if (customers.data.length === 0) {
      logStep("ERROR: No Stripe customer found for this user");
      throw new Error("No Stripe customer found for this user");
    }
    
    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { 
      customerId,
      customerCreated: customers.data[0].created,
      customerName: customers.data[0].name
    });

    const origin = req.headers.get("origin") || "https://xvtfkjjvzjjwpgrwteem.supabase.co";
    logStep("Creating customer portal session", { 
      customerId,
      returnUrl: `${origin}/`,
      origin
    });
    
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/`,
    });
    
    logStep("Customer portal session created successfully", { 
      sessionId: portalSession.id,
      url: portalSession.url,
      created: portalSession.created,
      returnUrl: portalSession.return_url
    });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    const errorType = error?.constructor?.name || 'Unknown';
    
    logStep("ERROR in customer-portal", { 
      message: errorMessage,
      stack: errorStack,
      type: errorType,
      timestamp: new Date().toISOString()
    });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: "Check function logs for detailed error information"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
