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

    const deepseekApiKey = Deno.env.get("DEEPSEEK_API_KEY");
    if (!deepseekApiKey) {
      return new Response(JSON.stringify({ error: "Deepseek API key not configured." }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    // Improved prompt to request both nutritional breakdown and healthy modifications
    const prompt = `Analyze this recipe and provide:
- A nutritional breakdown (calories, carbs, protein, fat, fiber, sodium, sugar, vitamins).
- Then, suggest specific ingredient and/or instruction modifications to make this recipe healthier (e.g., reduce sugar, swap fats, increase fiber, add more vegetables, reduce sodium, etc).
- Return your answer as clear, structured markdown, with sections titled "Nutritional Analysis" and "Suggestions to Make Healthier".

Recipe:
${title ? "Title: " + title : ""}
${text ? text : ""}`;

    // Call Deepseek's API
    // Reference: https://platform.deepseek.com/docs/api

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${deepseekApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
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
      throw new Error(data.error?.message || "Error processing Deepseek request.");
    }

    const result = data.choices?.[0]?.message?.content || "Analysis failed, please try again.";
    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-recipe (Deepseek):", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unexpected error." }),
      { status: 500, headers: corsHeaders }
    );
  }
});
