
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useRecipeForm = (session?: any, onSubmit?: (data: { title: string; text: string; file: File | null }) => void) => {
  const [title, setTitle] = useState("");
  const [recipeText, setRecipeText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [currentFileUrl, setCurrentFileUrl] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<string | null> => {
    // For anonymous users, we'll create a temporary file upload
    const userPrefix = session?.user?.id || 'anonymous';
    const fileExt = file.name.split('.').pop();
    const fileName = `${userPrefix}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('recipe-files')
      .upload(fileName, file);

    if (error) {
      console.error('File upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }

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

      if (file) {
        fileUrl = await uploadFile(file);
        setCurrentFileUrl(fileUrl);
        console.log("File uploaded successfully:", fileUrl);
      }

      if (textToAnalyze || fileUrl) {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        const headers: Record<string, string> = {
          "Content-Type": "application/json"
        };

        if (currentSession?.access_token) {
          headers["Authorization"] = `Bearer ${currentSession.access_token}`;
        }

        const response = await fetch(
          "https://xvtfkjjvzjjwpgrwteem.functions.supabase.co/analyze-recipe",
          {
            method: "POST",
            headers,
            body: JSON.stringify({ 
              title, 
              text: textToAnalyze,
              fileUrl: fileUrl 
            }),
          }
        );
        const resJson = await response.json();
        if (!response.ok || resJson.error) {
          if (resJson.suggestion === "copy_paste" || resJson.suggestion === "shorten_text") {
            setError(
              <div className="space-y-2">
                <div>{resJson.error}</div>
                <div className="text-xs text-muted-foreground">
                  💡 <strong>Tip:</strong> Try copying just the recipe ingredients and instructions from your file and pasting them in the text area above.
                </div>
              </div>
            );
          } else {
            setError(resJson.error || "Failed to analyze recipe.");
          }
          setAnalysis(null);
        } else {
          setAnalysis(resJson.result);
          setSubmitted(true);
          
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

  return {
    title,
    setTitle,
    recipeText,
    setRecipeText,
    file,
    setFile,
    isSubmitting,
    analysis,
    error,
    submitted,
    saving,
    saveSuccess,
    handleFormSubmit,
    resetForm,
    saveRecipe
  };
};
