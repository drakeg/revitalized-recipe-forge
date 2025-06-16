
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRecipeUserStatus } from "@/hooks/useRecipeUserStatus";
import RecipeInputSection from "./RecipeInputSection";
import RecipeResultSection from "./RecipeResultSection";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import RecipeAnalysisResult from "./RecipeAnalysisResult";
import RecipeFormHeader from "./RecipeFormHeader";
import RecipeTextInput from "./RecipeTextInput";
import RecipeFileInput from "./RecipeFileInput";
import RecipeSubmitButton from "./RecipeSubmitButton";
import { toast } from "@/hooks/use-toast";

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

  // Hide form after recipe has been analyzed
  const [submitted, setSubmitted] = useState(false);
  // Track saving state for "save" button
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  // Store file URL for saving to database
  const [currentFileUrl, setCurrentFileUrl] = useState<string | null>(null);

  const { isLoggedIn: userIsLoggedIn, isPaid: userIsPaid } = useRecipeUserStatus(session);

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!session?.user?.id) {
      throw new Error("User must be logged in to upload files");
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('recipe-files')
      .upload(fileName, file);

    if (error) {
      console.error('File upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('recipe-files')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setAnalysis(null);

    try {
      let fileUrl: string | null = null;
      let textToAnalyze = recipeText;

      // Handle file upload if a file is selected
      if (file) {
        if (!session?.user?.id) {
          setError("You must be logged in to upload files.");
          setIsSubmitting(false);
          return;
        }

        fileUrl = await uploadFile(file);
        setCurrentFileUrl(fileUrl);
        console.log("File uploaded successfully:", fileUrl);
      }

      // Analyze the recipe (either from text or file)
      if (textToAnalyze || fileUrl) {
        const response = await fetch(
          "https://xvtfkjjvzjjwpgrwteem.functions.supabase.co/analyze-recipe",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              title, 
              text: textToAnalyze,
              fileUrl: fileUrl 
            }),
          }
        );
        const resJson = await response.json();
        if (!response.ok || resJson.error) {
          setError(resJson.error || "Failed to analyze recipe.");
          setAnalysis(null);
        } else {
          setAnalysis(resJson.result);
          setSubmitted(true); // Hide the form
          
          // If we got extracted text from the file, update our state
          if (resJson.extractedText) {
            setRecipeText(resJson.extractedText);
          }
        }
      } else {
        setError("Please provide recipe text or upload a file to analyze.");
      }
      
      setIsSubmitting(false);
      if (onSubmit) onSubmit({ title, text: textToAnalyze, file });
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || "Unexpected error while analyzing.");
      setAnalysis(null);
    }
  };

  // Reset everything, show form again
  const resetForm = () => {
    setSubmitted(false);
    setAnalysis(null);
    setError(null);
    setTitle("");
    setRecipeText("");
    setFile(null);
    setSaveSuccess(null);
    setCurrentFileUrl(null);
  };

  // Save recipe to Supabase "recipes" table
  const saveRecipe = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Not Signed In",
        description: "You need to be signed in to save recipes.",
        variant: "destructive"
      });
      return;
    }
    if (!title || !analysis) {
      toast({
        title: "Missing Data",
        description: "Recipe title and analysis are required to save.",
        variant: "destructive"
      });
      return;
    }
    setSaving(true);
    setSaveSuccess(null);

    // Insert a new recipe for the current user
    const { error: dbError } = await supabase.from("recipes").insert([
      {
        user_id: session.user.id,
        title,
        original_text: recipeText,
        analysis,
        file_url: currentFileUrl,
      },
    ]);
    setSaving(false);
    if (dbError) {
      setSaveSuccess(null);
      toast({
        title: "Save Failed",
        description: dbError.message,
        variant: "destructive"
      });
    } else {
      setSaveSuccess("Recipe saved to your Recipe Book!");
      toast({
        title: "Recipe Saved",
        description: "Recipe added to your personal Recipe Book.",
        variant: "default"
      });
    }
  };

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
          <RecipeInputSection
            title={title}
            setTitle={setTitle}
            recipeText={recipeText}
            setRecipeText={setRecipeText}
            file={file}
            setFile={setFile}
            isSubmitting={isSubmitting}
            handleFormSubmit={handleFormSubmit}
            error={error}
            acceptedFileTypes={acceptedFileTypes}
          />
        )}
        {analysis && (
          <RecipeResultSection
            analysis={analysis}
            saveSuccess={saveSuccess}
            saving={saving}
            onConvertAnother={resetForm}
            onSave={saveRecipe}
            userIsLoggedIn={userIsLoggedIn}
            userIsPaid={userIsPaid}
          />
        )}
      </div>
    </section>
  );
};

export default RecipeForm;
