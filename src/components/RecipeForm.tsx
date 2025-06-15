import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import RecipeAnalysisResult from "./RecipeAnalysisResult";

// Use the supplied placeholder image as a background.
// Picking: "photo-1618160702438-9b02ab6515c9" - black and brown round fruit on brown wooden round plate.
const FOOD_BG =
  "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=800&q=80";

type RecipeFormProps = {
  onSubmit?: (data: { title: string; text: string; file: File | null }) => void;
};

const acceptedFileTypes =
  ".pdf,.txt,.doc,.docx,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const RecipeForm: React.FC<RecipeFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState("");
  const [recipeText, setRecipeText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setRecipeText("");
    }
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRecipeText(e.target.value);
    setFile(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setAnalysis(null);

    try {
      // Only analyze if there's text available; skip file uploads here (extension later)
      if (recipeText && recipeText.length > 0) {
        const response = await fetch(
          "https://xvtfkjjvzjjwpgrwteem.functions.supabase.co/analyze-recipe",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, text: recipeText }),
          }
        );
        const resJson = await response.json();
        if (!response.ok || resJson.error) {
          setError(resJson.error || "Failed to analyze recipe.");
          setAnalysis(null);
        } else {
          setAnalysis(resJson.result);
        }
      } else {
        setError("Uploading and analyzing files will be supported soon. Please paste recipe text for now.");
      }
      setIsSubmitting(false);
      setTitle("");
      setRecipeText("");
      setFile(null);
      if (onSubmit) onSubmit({ title, text: recipeText, file });
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || "Unexpected error while analyzing.");
      setAnalysis(null);
    }
  };

  return (
    <section className="w-full max-w-xl mx-auto relative my-10 animate-fade-in">
      {/* Food photo BG with overlay */}
      <div
        className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none z-0"
        aria-hidden
      >
        <img
          src={FOOD_BG}
          alt=""
          className="w-full h-full object-cover object-center min-h-[320px]"
          loading="lazy"
          style={{ filter: "brightness(0.69) blur(0.5px)" }}
        />
        {/* Soft colored overlay for readability */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(254,242,200,0.54) 0%, rgba(236,253,245,0.62) 100%)",
            mixBlendMode: "multiply",
          }}
        ></div>
        {/* Very subtle dark/white radial vignette for contrast */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(circle at 60% 25%, rgba(0,0,0,0.11) 0%, rgba(0,0,0,0.04) 65%, rgba(0,0,0,0) 100%)"
        }}></div>
      </div>
      {/* The card content above image background */}
      <div className="relative z-10 rounded-3xl border border-emerald-100 shadow-2xl bg-gradient-to-tr from-emerald-50/90 via-lime-50/90 to-yellow-50/95 p-7 backdrop-blur-md">
        <h1 className="text-3xl font-extrabold text-center mb-2 text-emerald-800 drop-shadow-md">
          Submit a Recipe for Instant Analysis
        </h1>
        <p className="text-center mb-6 text-lg text-lime-700">
          Paste your recipe or upload a file. No account needed!
        </p>
        <form
          onSubmit={handleFormSubmit}
          className="space-y-5"
          autoComplete="off"
          aria-label="Recipe submission form"
        >
          <div>
            <label
              htmlFor="recipe-title"
              className="block font-medium mb-1 text-green-900"
            >
              Recipe Title<span className="text-destructive">*</span>
            </label>
            <input
              id="recipe-title"
              type="text"
              className="input w-full p-2 rounded-lg border mt-1 outline-none bg-background focus:ring-2 ring-emerald-400 placeholder:text-muted-foreground"
              placeholder="e.g. Grandma's Apple Pie"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              maxLength={80}
            />
          </div>
          <div>
            <label
              htmlFor="recipe-text"
              className="block font-medium mb-1 text-green-900"
            >
              Paste Recipe Text
              <span className="text-muted-foreground ml-2">
                (or use file upload below)
              </span>
            </label>
            <textarea
              id="recipe-text"
              className="input w-full min-h-[100px] p-2 rounded-lg border mt-1 outline-none bg-background focus:ring-2 ring-emerald-400 placeholder:text-muted-foreground"
              placeholder="Paste your recipe here..."
              value={recipeText}
              onChange={handleTextAreaChange}
              disabled={!!file}
              maxLength={4000}
            />
          </div>
          <div>
            <label
              htmlFor="recipe-file"
              className="block font-medium mb-1 text-green-900"
            >
              Upload Recipe File
              <span className="text-muted-foreground ml-2">
                (PDF, DOC, DOCX, TXT)
              </span>
            </label>
            <input
              id="recipe-file"
              type="file"
              accept={acceptedFileTypes}
              className="block w-full text-base file:bg-emerald-500 file:text-white file:rounded file:border-none file:py-2 file:px-4 file:font-medium file:cursor-pointer"
              onChange={handleFileChange}
              disabled={!!recipeText}
            />
            {file && (
              <div className="mt-2 text-sm text-muted-foreground">
                Selected: <span className="font-medium">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 px-2 py-0 text-xs text-emerald-800 hover:bg-yellow-100"
                  type="button"
                  onClick={() => setFile(null)}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
          <Button
            size="lg"
            className="w-full font-semibold mt-2 bg-gradient-to-r from-emerald-500 via-amber-300 to-yellow-300 text-[#111] shadow-[0_2px_8px_rgba(0,0,0,0.11)] rounded-lg hover:from-emerald-600 hover:via-amber-400 hover:to-yellow-400 transition-all drop-shadow"
            type="submit"
            disabled={isSubmitting || (!recipeText && !file) || !title}
            style={{
              textShadow:
                "0 1.5px 3px rgba(255,255,255,0.7), 0 0px 1px rgba(0,0,0,0.10)",
              border: "2px solid #059669",
              letterSpacing: "0.02em",
              fontWeight: 800,
            }}
          >
            {isSubmitting ? (
              <>
                <Upload className="animate-spin mr-2" size={20} />
                <span
                  className="relative font-extrabold text-base px-2 py-1"
                  style={{
                    borderRadius: 8,
                    background:
                      "linear-gradient(90deg,rgba(255,255,255,0.32)_0%,rgba(255,255,255,0.18)_100%)",
                    backdropFilter: "blur(1.5px)",
                    WebkitBackdropFilter: "blur(1.5px)",
                    boxShadow: "0 1px 4px rgba(180,180,120,0.06)",
                    color: "#111",
                    textShadow:
                      "0 2px 7px rgba(255,255,255,0.7), 0 0px 1px rgba(0,0,0,0.15)",
                    fontSize: "1.19rem",
                  }}
                >
                  Submitting...
                </span>
              </>
            ) : (
              <>
                <Upload className="mr-2" size={20} />
                <span
                  className="relative font-extrabold text-base px-2 py-1"
                  style={{
                    borderRadius: 8,
                    background:
                      "linear-gradient(90deg,rgba(255,255,255,0.33)_0%,rgba(255,255,255,0.21)_100%)",
                    backdropFilter: "blur(1.5px)",
                    WebkitBackdropFilter: "blur(1.5px)",
                    boxShadow: "0 1px 4px rgba(180,180,120,0.06)",
                    color: "#111",
                    textShadow:
                      "0 2px 7px rgba(255,255,255,0.8), 0 0px 1px rgba(0,0,0,0.18)",
                    fontSize: "1.22rem",
                  }}
                >
                  Submit Recipe
                </span>
              </>
            )}
          </Button>
        </form>
        {error && (
          <div className="mt-4 text-center text-destructive text-sm font-semibold">{error}</div>
        )}
        {analysis && <RecipeAnalysisResult result={analysis} />}
      </div>
    </section>
  );
};

export default RecipeForm;
