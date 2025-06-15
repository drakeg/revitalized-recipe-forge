import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import RecipeAnalysisResult from "./RecipeAnalysisResult";
import RecipeFormHeader from "./RecipeFormHeader";
import RecipeTextInput from "./RecipeTextInput";
import RecipeFileInput from "./RecipeFileInput";
import RecipeSubmitButton from "./RecipeSubmitButton";

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
        <RecipeFormHeader />
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
          <RecipeTextInput
            value={recipeText}
            onChange={handleTextAreaChange}
            disabled={!!file}
          />
          <RecipeFileInput
            file={file}
            onFileChange={handleFileChange}
            onRemove={() => setFile(null)}
            disabled={!!recipeText}
            acceptedFileTypes={acceptedFileTypes}
          />
          <RecipeSubmitButton
            isSubmitting={isSubmitting}
            disabled={isSubmitting || (!recipeText && !file) || !title}
          />
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
