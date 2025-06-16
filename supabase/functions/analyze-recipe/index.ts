
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Approximate token limit (leaving room for system prompt and response)
const MAX_TEXT_LENGTH = 50000; // Conservative limit for text characters

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, text, fileUrl, url } = await req.json();

    let textToAnalyze = text || "";

    // If a URL is provided, fetch and extract recipe content
    if (url && !text && !fileUrl) {
      console.log("Processing URL:", url);
      
      try {
        const urlResponse = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        if (!urlResponse.ok) {
          throw new Error(`Failed to fetch URL: ${urlResponse.statusText}`);
        }

        const htmlContent = await urlResponse.text();
        
        // Extract recipe content using various methods
        textToAnalyze = extractRecipeFromHtml(htmlContent);
        
        if (!textToAnalyze || textToAnalyze.length < 50) {
          return new Response(JSON.stringify({ 
            error: "Could not extract recipe content from the URL. Please try copying and pasting the recipe text instead." 
          }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.log("Extracted text from URL, length:", textToAnalyze.length);
        
      } catch (urlError) {
        console.error("URL processing error:", urlError);
        return new Response(JSON.stringify({ 
          error: "Failed to fetch recipe from URL. Please check the URL or try copying and pasting the recipe text instead." 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // If a file URL is provided, download and extract text from it
    if (fileUrl && !text && !url) {
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
              headers: { ...corsHeaders, "Content-Type": "application/json" },
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
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        } else {
          return new Response(JSON.stringify({ 
            error: "Unsupported file format. Please use PDF, DOC, DOCX, or TXT files." 
          }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.log("Extracted text length:", textToAnalyze.length);
        
        // Check if the extracted text is too long for the AI model
        if (textToAnalyze.length > MAX_TEXT_LENGTH) {
          return new Response(JSON.stringify({ 
            error: `The file contains too much text (${textToAnalyze.length} characters). Our AI can process up to ${MAX_TEXT_LENGTH} characters at a time. Please try copying and pasting just the recipe portion from your file, or upload a smaller file with only the recipe content.`,
            textLength: textToAnalyze.length,
            maxLength: MAX_TEXT_LENGTH,
            suggestion: "copy_paste"
          }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch (fileError) {
        console.error("File processing error:", fileError);
        return new Response(JSON.stringify({ 
          error: "Failed to process uploaded file. Please try copying and pasting the recipe text instead." 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Also check if manually entered text is too long
    if (textToAnalyze.length > MAX_TEXT_LENGTH) {
      return new Response(JSON.stringify({ 
        error: `The recipe text is too long (${textToAnalyze.length} characters). Please shorten it to under ${MAX_TEXT_LENGTH} characters, or break it into smaller recipes.`,
        textLength: textToAnalyze.length,
        maxLength: MAX_TEXT_LENGTH
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!textToAnalyze && !title) {
      return new Response(JSON.stringify({ error: "Recipe title or text is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const deepseekApiKey = Deno.env.get("DEEPSEEK_API_KEY");
    if (!deepseekApiKey) {
      return new Response(JSON.stringify({ error: "Deepseek API key not configured." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
      // Handle specific token limit errors
      if (data.error?.message?.includes("maximum context length")) {
        return new Response(JSON.stringify({ 
          error: `The recipe is too long for our AI to process. Please try shortening the text or copying just the main recipe content.`,
          suggestion: "shorten_text"
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(data.error?.message || "Error processing Deepseek request.");
    }

    const result = data.choices?.[0]?.message?.content || "Analysis failed, please try again.";
    
    return new Response(JSON.stringify({ 
      result,
      extractedText: (fileUrl || url) ? textToAnalyze : undefined 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    } catch (error) {
      console.error("Error in analyze-recipe (Deepseek):", error);
      return new Response(
        JSON.stringify({ error: error.message || "Unexpected error." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  // Method not allowed
  return new Response(
    JSON.stringify({ error: "Method not allowed" }),
    { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});

function extractRecipeFromHtml(html: string): string {
  // Remove script and style tags
  let cleanHtml = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  cleanHtml = cleanHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Try to find JSON-LD structured data first
  const jsonLdMatch = cleanHtml.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (jsonLdMatch) {
    try {
      const jsonData = JSON.parse(jsonLdMatch[1]);
      if (jsonData['@type'] === 'Recipe' || (Array.isArray(jsonData) && jsonData.some(item => item['@type'] === 'Recipe'))) {
        const recipe = Array.isArray(jsonData) ? jsonData.find(item => item['@type'] === 'Recipe') : jsonData;
        let recipeText = '';
        
        if (recipe.name) recipeText += `${recipe.name}\n\n`;
        if (recipe.description) recipeText += `${recipe.description}\n\n`;
        
        if (recipe.recipeIngredient) {
          recipeText += 'Ingredients:\n';
          recipe.recipeIngredient.forEach((ingredient: string) => {
            recipeText += `- ${ingredient}\n`;
          });
          recipeText += '\n';
        }
        
        if (recipe.recipeInstructions) {
          recipeText += 'Instructions:\n';
          recipe.recipeInstructions.forEach((instruction: any, index: number) => {
            const text = typeof instruction === 'string' ? instruction : instruction.text;
            recipeText += `${index + 1}. ${text}\n`;
          });
        }
        
        if (recipeText.length > 100) {
          return recipeText;
        }
      }
    } catch (e) {
      console.log('Failed to parse JSON-LD:', e);
    }
  }
  
  // Fallback: extract text from common recipe selectors
  const recipeSelectors = [
    '.recipe-content', '.recipe-text', '.recipe-instructions', '.recipe-ingredients',
    '[class*="recipe"]', '[class*="ingredient"]', '[class*="instruction"]',
    '.entry-content', '.post-content', '.content'
  ];
  
  let extractedText = '';
  
  // Simple HTML tag removal and text extraction
  const textContent = cleanHtml.replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Look for recipe-like patterns
  const recipePatterns = [
    /ingredients?[\s\S]*?(?=instructions?|directions?|method|steps)/i,
    /instructions?[\s\S]*?(?=nutrition|notes|tips|serves|prep time)/i,
    /directions?[\s\S]*?(?=nutrition|notes|tips|serves|prep time)/i
  ];
  
  for (const pattern of recipePatterns) {
    const match = textContent.match(pattern);
    if (match) {
      extractedText += match[0] + '\n\n';
    }
  }
  
  // If no specific patterns found, return a portion of the cleaned text
  if (!extractedText && textContent.length > 200) {
    // Try to find text that looks like a recipe (contains common food words)
    const foodWords = ['cup', 'tablespoon', 'teaspoon', 'pound', 'ounce', 'gram', 'ingredient', 'cook', 'bake', 'mix', 'add', 'heat', 'stir'];
    const sentences = textContent.split(/[.!?]+/);
    const recipeSentences = sentences.filter(sentence => 
      foodWords.some(word => sentence.toLowerCase().includes(word))
    );
    
    if (recipeSentences.length > 3) {
      extractedText = recipeSentences.slice(0, 20).join('. ') + '.';
    }
  }
  
  return extractedText.trim();
}
