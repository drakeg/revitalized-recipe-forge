
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

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
    const { title, text, fileUrl } = await req.json();

    let textToAnalyze = text || "";

    // If a file URL is provided, download and extract text from it
    if (fileUrl && !text) {
      console.log("Processing file:", fileUrl);
      
      try {
        const fileResponse = await fetch(fileUrl);
        if (!fileResponse.ok) {
          throw new Error(`Failed to download file: ${fileResponse.statusText}`);
        }

        const fileBuffer = await fileResponse.arrayBuffer();
        const fileName = fileUrl.split('/').pop()?.toLowerCase() || '';
        
        if (fileName.endsWith('.txt')) {
          // Handle plain text files
          const decoder = new TextDecoder('utf-8');
          textToAnalyze = decoder.decode(fileBuffer);
        } else if (fileName.endsWith('.pdf')) {
          // For PDFs, we'll extract what we can (this is a basic implementation)
          // In a production environment, you'd want to use a proper PDF parsing library
          const decoder = new TextDecoder('utf-8', { fatal: false });
          const pdfText = decoder.decode(fileBuffer);
          // Basic PDF text extraction - look for readable text patterns
          const textMatches = pdfText.match(/[a-zA-Z0-9\s\.,!?;:'"()-]+/g);
          if (textMatches) {
            textToAnalyze = textMatches.join(' ').replace(/\s+/g, ' ').trim();
          }
          
          if (!textToAnalyze || textToAnalyze.length < 50) {
            return new Response(JSON.stringify({ 
              error: "Could not extract readable text from PDF. Please try copying and pasting the recipe text instead." 
            }), {
              status: 400,
              headers: corsHeaders,
            });
          }
        } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
          // Basic DOC/DOCX handling - in production you'd want a proper library
          const decoder = new TextDecoder('utf-8', { fatal: false });
          const docText = decoder.decode(fileBuffer);
          // Extract readable text patterns
          const textMatches = docText.match(/[a-zA-Z0-9\s\.,!?;:'"()-]+/g);
          if (textMatches) {
            textToAnalyze = textMatches.join(' ').replace(/\s+/g, ' ').trim();
          }
          
          if (!textToAnalyze || textToAnalyze.length < 50) {
            return new Response(JSON.stringify({ 
              error: "Could not extract readable text from document. Please try copying and pasting the recipe text instead." 
            }), {
              status: 400,
              headers: corsHeaders,
            });
          }
        } else {
          return new Response(JSON.stringify({ 
            error: "Unsupported file format. Please use PDF, DOC, DOCX, or TXT files." 
          }), {
            status: 400,
            headers: corsHeaders,
          });
        }

        console.log("Extracted text length:", textToAnalyze.length);
      } catch (fileError) {
        console.error("File processing error:", fileError);
        return new Response(JSON.stringify({ 
          error: "Failed to process uploaded file. Please try copying and pasting the recipe text instead." 
        }), {
          status: 400,
          headers: corsHeaders,
        });
      }
    }

    if (!textToAnalyze && !title) {
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

    // Strong system prompt: nutritionist, professional food writer, clean markdown
    const systemPrompt = `You are a nutritionist, expert healthy chef, and professional recipe writer.
You return answers ONLY in clean, well-structured markdown suitable for recipe websites.
Format all Markdown with clear headings, ingredient/instruction lists or tables as makes sense.`

    // User prompt for Deepseek: rewrite a healthier recipe, return clean label
    const prompt = `Given the following recipe, produce a brand new, healthier version. 
1. First, return ONLY your newly written, healthier recipe—ingredients and instructions—in standard website format (with section headings, clean lists, clear formatting).
2. After the recipe, display a simple nutrition label covering ONLY these: Calories, Carbohydrates, Protein, Fat, Fiber, Sugar.
    - Use a readable markdown table or clear layout, separate from the recipe.
DO NOT include analysis, commentary, or excess text.

RECIPE:
${title ? "Title: " + title : ""}
${textToAnalyze ? textToAnalyze : ""}`;

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${deepseekApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.25,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || "Error processing Deepseek request.");
    }

    const result = data.choices?.[0]?.message?.content || "Analysis failed, please try again.";
    
    return new Response(JSON.stringify({ 
      result,
      extractedText: fileUrl ? textToAnalyze : undefined 
    }), {
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
