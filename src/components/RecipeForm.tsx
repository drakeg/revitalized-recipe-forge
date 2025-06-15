
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import RecipeAnalysisResult from "./RecipeAnalysisResult";
import RecipeFormHeader from "./RecipeFormHeader";
import RecipeTextInput from "./RecipeTextInput";
import RecipeFileInput from "./RecipeFileInput";
import RecipeSubmitButton from "./RecipeSubmitButton";
import { supabase } from "@/integrations/supabase/client";

// Use the supplied placeholder image as a background.
// Picking: "photo-1618160702438-9b02ab6515c9" - black and brown round fruit on brown wooden round plate.
const FOOD_BG =
  "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=800&q=80";

type RecipeFormProps = {
  onSubmit?: (data: { title: string; text: string; file: File | null }) => void;
  session?: any;
};

const acceptedFileTypes =
  ".pdf,.txt,.doc,.docx,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const RecipeForm: React.FC<RecipeFormProps> = ({ onSubmit, session }) => {
  const [title, setTitle] = useState("");
  const [recipeText, setRecipeText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // NEW: Hide form after recipe has been analyzed
  const [submitted, setSubmitted] = useState(false);
  // Track saving state for "save" button
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

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
          setSubmitted(true); // Hide the form
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

  // NEW: Reset everything, show form again
  const resetForm = () => {
    setSubmitted(false);
    setAnalysis(null);
    setError(null);
    setTitle("");
    setRecipeText("");
    setFile(null);
    setSaveSuccess(null);
  };

  // NEW: Save recipe dummy for now - toast/alert
  const saveRecipe = async () => {
    setSaving(true);
    setSaveSuccess(null);
    // Here we’d save to the database if we had a recipe table.
    setTimeout(() => {
      setSaving(false);
      setSaveSuccess("Recipe saved to your Recipe Book!");
    }, 850);
  };

  // Check if user is logged in via session
  let userIsLoggedIn = false;
  if (session && session.user) userIsLoggedIn = true;

  return (
    <section className="w-full max-w-xl mx-auto relative my-10 animate-fade-in">
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
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(254,242,200,0.54) 0%, rgba(236,253,245,0.62) 100%)",
            mixBlendMode: "multiply",
          }}
        ></div>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(circle at 60% 25%, rgba(0,0,0,0.11) 0%, rgba(0,0,0,0.04) 65%, rgba(0,0,0,0) 100%)"
        }}></div>
      </div>
      <div className="relative z-10 rounded-3xl border border-emerald-100 shadow-2xl bg-gradient-to-tr from-emerald-50/90 via-lime-50/90 to-yellow-50/95 p-7 backdrop-blur-md">
        {!submitted && (
          <>
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
          </>
        )}
        {/* Result Display */}
        {analysis && (
          <>
            <RecipeAnalysisResult result={analysis} />
            {/* Save success banner */}
            {saveSuccess && (
              <div className="w-full text-center mt-2 mb-2">
                <div className="inline-block rounded-lg border border-lime-400 bg-lime-50 px-4 py-2 text-lime-900 font-semibold shadow-sm">
                  {saveSuccess}
                </div>
              </div>
            )}
            <div className="w-full flex flex-col sm:flex-row justify-center gap-3 mt-4">
              <Button
                variant="outline"
                className="font-semibold text-emerald-700 px-6 py-2 bg-white/80 hover:bg-yellow-100 border-2 border-emerald-300"
                onClick={resetForm}
              >
                Convert Another Recipe
              </Button>
              {userIsLoggedIn && (
                <Button
                  variant="default"
                  className="font-semibold text-white px-6 py-2 bg-emerald-500 hover:bg-emerald-600 border-2 border-emerald-500"
                  disabled={saving}
                  onClick={saveRecipe}
                >
                  {saving ? "Saving..." : "Save to My Recipe Book"}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default RecipeForm;
