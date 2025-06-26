import React, { useState, useCallback } from "react";
import { Session } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import RecipeForm from "@/components/RecipeForm";
import RecipeResultSection from "@/components/RecipeResultSection";
import RecipeFormHeader from "@/components/RecipeFormHeader";
import RecipeFormError from "@/components/RecipeFormError";
import HowItWorks from "@/components/HowItWorks";
import UpgradeBanner from "@/components/UpgradeBanner";
import { useRecipeForm } from "@/hooks/useRecipeForm";
import { useRecipeUserStatus } from "@/hooks/useRecipeUserStatus";

interface IndexProps {
  session: Session | null;
}

const Index: React.FC<IndexProps> = ({ session }) => {
  const {
    recipeInput,
    result,
    error,
    isAnalyzing,
    isSaving,
    inputMethod,
    urlInput,
    handleInputChange,
    handleFileChange,
    handleSubmit,
    handleSaveRecipe,
    setInputMethod,
    setUrlInput,
  } = useRecipeForm();

  const { isLoggedIn, isPaid } = useRecipeUserStatus(session);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50">
      <Navbar 
        loggedIn={!!session} 
        userEmail={session?.user?.email} 
        session={session} 
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* Upgrade Banner - Show prominently at the top */}
        <UpgradeBanner 
          isLoggedIn={!!session} 
          isPaid={isPaid} 
        />

        <div className="max-w-4xl mx-auto">
          <RecipeFormHeader />
          
          {error && <RecipeFormError error={error} />}
          
          <RecipeForm 
            recipeInput={recipeInput}
            onInputChange={handleInputChange}
            onFileChange={handleFileChange}
            onSubmit={handleSubmit}
            isAnalyzing={isAnalyzing}
            inputMethod={inputMethod}
            onInputMethodChange={setInputMethod}
            urlInput={urlInput}
            onUrlChange={setUrlInput}
            error={error}
          />
          
          {result && (
            <RecipeResultSection 
              result={result} 
              onSave={handleSaveRecipe}
              isSaving={isSaving}
              showSaveButton={isLoggedIn}
            />
          )}
        </div>
        
        <HowItWorks />
      </main>
    </div>
  );
};

export default Index;
