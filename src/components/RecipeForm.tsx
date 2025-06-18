
import React from "react";
import { useRecipeUserStatus } from "@/hooks/useRecipeUserStatus";
import { useRecipeForm } from "@/hooks/useRecipeForm";
import RecipeInputSection from "./RecipeInputSection";
import RecipeResultSection from "./RecipeResultSection";

const FOOD_BG =
  "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=800&q=80";

type RecipeFormProps = {
  onSubmit?: (data: { title: string; text: string; file: File | null; url: string }) => void;
  session?: any;
};

const acceptedFileTypes =
  ".pdf,.txt,.doc,.docx,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const RecipeForm: React.FC<RecipeFormProps> = ({ onSubmit, session }) => {
  const { isLoggedIn: userIsLoggedIn, isPaid: userIsPaid } = useRecipeUserStatus(session);
  
  const {
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
  } = useRecipeForm(session, onSubmit);

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
            url={url}
            setUrl={setUrl}
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
            session={session}
          />
        )}
      </div>
    </section>
  );
};

export default RecipeForm;
