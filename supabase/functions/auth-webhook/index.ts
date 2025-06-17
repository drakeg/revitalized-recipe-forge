
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthWebhookPayload {
  event: string;
  user: {
    id: string;
    email: string;
    email_confirmed_at?: string;
  };
  email_data?: {
    token_hash: string;
    redirect_to?: string;
    email_action_type: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Auth webhook called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: AuthWebhookPayload = await req.json();
    console.log("Webhook payload event:", payload.event);

    // Handle signup event - send confirmation email
    if (payload.event === "user.created" && payload.email_data) {
      console.log("Sending confirmation email for new user:", payload.user.email);
      
      // Call our email function
      const emailResponse = await supabase.functions.invoke("send-confirmation-email", {
        body: {
          email: payload.user.email,
          token_hash: payload.email_data.token_hash,
          redirect_to: payload.email_data.redirect_to,
          email_action_type: payload.email_data.email_action_type,
        },
      });

      if (emailResponse.error) {
        console.error("Failed to send confirmation email:", emailResponse.error);
        throw new Error("Failed to send confirmation email");
      }

      console.log("Confirmation email sent successfully");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in auth webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
