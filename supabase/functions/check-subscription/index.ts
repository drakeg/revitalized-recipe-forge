
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
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
      origin: req.headers.get("origin")
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

    // Use service role key for database operations
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

    // First, check if this user has been manually granted premium access in the database
    logStep("Checking local database for manual premium access");
    const { data: localSubscriber, error: localError } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("email", user.email)
      .single();

    if (!localError && localSubscriber?.subscribed) {
      logStep("Found manual premium access in database", {
        subscribed: localSubscriber.subscribed,
        subscriptionTier: localSubscriber.subscription_tier,
        subscriptionEnd: localSubscriber.subscription_end
      });

      // Also update the profiles table to ensure consistency
      const profileUpdate = await supabaseClient.from("profiles").update({
        is_paid: true
      }).eq("id", user.id);

      logStep("Profile table update", { 
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
    logStep("Stripe client initialized", { apiVersion: "2023-10-16" });
    
    logStep("Looking up Stripe customer", { email: user.email });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    logStep("Customer lookup completed", { 
      customersFound: customers.data.length,
      hasMore: customers.has_more
    });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      
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

      logStep("Subscriber table update", { 
        error: subscriberUpsert.error?.message,
        success: !subscriberUpsert.error
      });

      const profileUpdate = await supabaseClient.from("profiles").update({
        is_paid: false
      }).eq("id", user.id);

      logStep("Profile table update", { 
        error: profileUpdate.error?.message,
        success: !profileUpdate.error
      });

      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { 
      customerId,
      customerCreated: customers.data[0].created,
      customerName: customers.data[0].name
    });

    logStep("Looking up active subscriptions");
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = null;
    let subscriptionEnd = null;

    logStep("Subscription lookup completed", {
      activeSubscriptions: subscriptions.data.length,
      hasActiveSub
    });

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Active subscription found", { 
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
      
      logStep("Determined subscription tier", { 
        priceId,
        amount,
        subscriptionTier,
        currency: price.currency
      });
    } else {
      logStep("No active subscription found");
    }

    // Update both subscribers and profiles tables
    logStep("Updating database with subscription info");
    
    const subscriberUpsert = await supabaseClient.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    logStep("Subscriber table upsert", { 
      error: subscriberUpsert.error?.message,
      success: !subscriberUpsert.error
    });

    const profileUpdate = await supabaseClient.from("profiles").update({
      is_paid: hasActiveSub
    }).eq("id", user.id);

    logStep("Profile table update", { 
      error: profileUpdate.error?.message,
      success: !profileUpdate.error
    });

    const responseData = {
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd
    };

    logStep("Function completed successfully", responseData);
    
    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    const errorType = error?.constructor?.name || 'Unknown';
    
    logStep("ERROR in check-subscription", { 
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
