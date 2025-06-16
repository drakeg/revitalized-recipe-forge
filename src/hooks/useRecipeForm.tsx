
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useRecipeForm = (session?: any, onSubmit?: (data: { title: string; text: string; file: File | null; url: string }) => void) => {
  const [title, setTitle] = useState("");
  const [recipeText, setRecipeText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
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

      if (textToAnalyze || fileUrl || url) {
        // Get current session if it exists
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        const headers: Record<string, string> = {
          "Content-Type": "application/json"
        };

        // Add auth header if user is logged in, but don't require it
        if (currentSession?.access_token) {
          headers["Authorization"] = `Bearer ${currentSession.access_token}`;
        }

        // Add a flag to indicate this is an anonymous request
        const requestBody: any = { 
          title, 
          text: textToAnalyze,
          fileUrl: fileUrl,
          url: url,
          isAnonymous: !currentSession?.user?.id
        };

        console.log("Sending recipe analysis request:", { 
          hasSession: !!currentSession?.user?.id,
          isAnonymous: !currentSession?.user?.id,
          hasFile: !!fileUrl,
          hasText: !!textToAnalyze,
          hasUrl: !!url
        });

        const response = await fetch(
          "https://xvtfkjjvzjjwpgrwteem.functions.supabase.co/analyze-recipe",
          {
            method: "POST",
            headers,
            body: JSON.stringify(requestBody),
          }
        );
        
        const resJson = await response.json();
        console.log("Recipe analysis response:", { status: response.status, resJson });
        
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
        setError("Please provide recipe text, upload a file, or enter a recipe URL to analyze.");
      }
      
      setIsSubmitting(false);
      if (onSubmit) onSubmit({ title, text: textToAnalyze, file, url });
    } catch (err: any) {
      console.error("Error in handleFormSubmit:", err);
      setIsSubmitting(false);
      setError(err.message || "Unexpected error while analyzing. Please try again.");
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
    setUrl("");
    setSaveSuccess(null);
    setCurrentFileUrl(null);
  };

  const saveRecipe = async () => {
    console.log("🔄 saveRecipe function called");
    console.log("🔍 Session data:", {
      sessionExists: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    });
    console.log("🔍 Recipe data:", {
      title,
      hasAnalysis: !!analysis,
      analysisLength: analysis?.length || 0,
      recipeTextLength: recipeText?.length || 0,
      currentFileUrl,
      url
    });

    if (!session?.user?.id) {
      console.error("❌ No user session found");
      toast({
        title: "Not Signed In",
        description: "You need to be signed in to save recipes.",
        variant: "destructive"
      });
      return;
    }

    if (!title || !analysis) {
      console.error("❌ Missing required data:", { hasTitle: !!title, hasAnalysis: !!analysis });
      toast({
        title: "Missing Data",
        description: "Recipe title and analysis are required to save.",
        variant: "destructive"
      });
      return;
    }

    console.log("✅ Validation passed, attempting to save recipe");
    setSaving(true);
    setSaveSuccess(null);

    try {
      console.log("📝 Inserting recipe into database...");
      const insertData = {
        user_id: session.user.id,
        title,
        original_text: recipeText,
        analysis,
        file_url: currentFileUrl,
        source_url: url,
      };
      console.log("📋 Insert data:", insertData);

      const { data, error: dbError } = await supabase
        .from("recipes")
        .insert([insertData])
        .select();

      console.log("📊 Database response:", { data, error: dbError });

      setSaving(false);
      
      if (dbError) {
        console.error("❌ Database error:", dbError);
        setSaveSuccess(null);
        toast({
          title: "Save Failed",
          description: dbError.message,
          variant: "destructive"
        });
      } else {
        console.log("✅ Recipe saved successfully:", data);
        setSaveSuccess("Recipe saved to your Recipe Book!");
        toast({
          title: "Recipe Saved",
          description: "Recipe added to your personal Recipe Book.",
          variant: "default"
        });
      }
    } catch (err: any) {
      console.error("❌ Exception during save:", err);
      setSaving(false);
      setSaveSuccess(null);
      toast({
        title: "Save Failed",
        description: "An unexpected error occurred while saving.",
        variant: "destructive"
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
    url,
    setUrl,
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
