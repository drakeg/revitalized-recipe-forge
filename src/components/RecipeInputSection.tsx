
import React from "react";
import RecipeFormHeader from "./RecipeFormHeader";
import RecipeTextInput from "./RecipeTextInput";
import RecipeFileInput from "./RecipeFileInput";
import RecipeSubmitButton from "./RecipeSubmitButton";
import RecipeFormError from "./RecipeFormError";

interface RecipeInputSectionProps {
  title: string;
  setTitle: (val: string) => void;
  recipeText: string;
  setRecipeText: (val: string) => void;
  file: File | null;
  setFile: (file: File | null) => void;
  isSubmitting: boolean;
  handleFormSubmit: (e: React.FormEvent) => void;
  error: string | React.ReactNode | null;
  acceptedFileTypes: string;
}

const RecipeInputSection: React.FC<RecipeInputSectionProps> = ({
  title,
  setTitle,
  recipeText,
  setRecipeText,
  file,
  setFile,
  isSubmitting,
  handleFormSubmit,
  error,
  acceptedFileTypes,
}) => {
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

  return (
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
      <RecipeFormError error={error} />
    </>
  );
};

export default RecipeInputSection;
