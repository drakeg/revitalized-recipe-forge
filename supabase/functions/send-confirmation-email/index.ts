
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  token_hash: string;
  redirect_to?: string;
  email_action_type: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Email confirmation function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: EmailRequest = await req.json();
    console.log("Email request body:", { ...body, token_hash: "***" });

    const { email, token_hash, redirect_to, email_action_type } = body;

    if (!email || !token_hash || !email_action_type) {
      throw new Error("Missing required fields");
    }

    // Build the confirmation URL
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to || window.location.origin}`;

    console.log("Sending confirmation email to:", email);

    const emailResponse = await resend.emails.send({
      from: "Revitalized Recipe Forge <onboarding@resend.dev>",
      to: [email],
      subject: "Confirm your email address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; margin-bottom: 10px;">🍃 Revitalized Recipe Forge</h1>
            <h2 style="color: #374151; font-size: 24px; margin: 0;">Welcome! Please confirm your email</h2>
          </div>
          
          <div style="background: #f9fafb; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              Thanks for signing up! To complete your registration and start using all the features, please confirm your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${confirmationUrl}" 
                 style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Confirm Email Address
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.4; margin-top: 20px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${confirmationUrl}" style="color: #10b981; word-break: break-all;">${confirmationUrl}</a>
            </p>
          </div>
          
          <div style="text-align: center; color: #9ca3af; font-size: 12px;">
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <p>This confirmation link will expire in 24 hours.</p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, id: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Failed to send confirmation email"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
