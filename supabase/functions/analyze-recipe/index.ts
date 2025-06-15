
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, text } = await req.json();

    if (!text && !title) {
      return new Response(JSON.stringify({ error: "Recipe title or text is required." }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(JSON.stringify({ error: "OpenAI API key not configured." }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    // Construct the prompt
    const prompt = `Analyze this recipe and provide a nutritional breakdown (calories, carbs, protein, fat, fiber, sodium, sugar, vitamins), suitable for showing a summary to a health-conscious cook. Format your answer as a short readable markdown section. Recipe:\n${title ? "Title: " + title : ""}\n${text ? text : ""}`;

    // Call OpenAI's API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // fast/cheap; can upgrade if needed
        messages: [
          { role: "system", content: "You are a nutritionist assistant. Return clear, well-structured, short markdown answers for recipe analysis requests." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 800,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || "Error processing OpenAI request.");
    }

    const result = data.choices?.[0]?.message?.content || "Analysis failed, please try again.";
    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-recipe:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unexpected error." }),
      { status: 500, headers: corsHeaders }
    );
  }
});
