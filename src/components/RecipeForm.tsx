
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setTitle("");
      setRecipeText("");
      setFile(null);
      if (onSubmit)
        onSubmit({ title, text: recipeText, file });
      alert("Recipe submitted! (Functionality coming soon.)");
    }, 1000);
  };

  return (
    <section className="w-full max-w-xl mx-auto relative rounded-3xl border border-emerald-100 shadow-2xl bg-gradient-to-tr from-emerald-50 via-lime-50 to-yellow-50 p-7 my-10 animate-fade-in">
      <h1 className="text-3xl font-extrabold text-center mb-2 text-emerald-800 drop-shadow-md">Submit a Recipe for Instant Analysis</h1>
      <p className="text-center mb-6 text-lg text-lime-700">Paste your recipe or upload a file. No account needed!</p>
      <form
        onSubmit={handleFormSubmit}
        className="space-y-5"
        autoComplete="off"
        aria-label="Recipe submission form"
      >
        <div>
          <label htmlFor="recipe-title" className="block font-medium mb-1 text-green-900">
            Recipe Title<span className="text-destructive">*</span>
          </label>
          <input
            id="recipe-title"
            type="text"
            className="input w-full p-2 rounded-lg border mt-1 outline-none bg-background focus:ring-2 ring-emerald-400 placeholder:text-muted-foreground"
            placeholder="e.g. Grandma's Apple Pie"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
            maxLength={80}
          />
        </div>
        <div>
          <label htmlFor="recipe-text" className="block font-medium mb-1 text-green-900">
            Paste Recipe Text
            <span className="text-muted-foreground ml-2">(or use file upload below)</span>
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
          <label htmlFor="recipe-file" className="block font-medium mb-1 text-green-900">
            Upload Recipe File
            <span className="text-muted-foreground ml-2">(PDF, DOC, DOCX, TXT)</span>
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
          className="w-full font-semibold mt-2 bg-gradient-to-r from-emerald-500 via-amber-300 to-yellow-300 text-emerald-900 shadow-[0_2px_8px_rgba(0,0,0,0.07)] rounded-lg hover:from-emerald-600 hover:via-amber-400 hover:to-yellow-400 transition-all drop-shadow"
          type="submit"
          disabled={isSubmitting || (!recipeText && !file) || !title}
          style={{
            textShadow: "0 1px 2px rgba(255,255,255,0.4), 0 0px 0 #fff",
            border: "2px solid #059669", // emerald-600
          }}
        >
          {isSubmitting ? (
            <>
              <Upload className="animate-spin mr-2" size={20} /> Submitting...
            </>
          ) : (
            <>
              <Upload className="mr-2" size={20} /> <span className="font-extrabold">Submit Recipe</span>
            </>
          )}
        </Button>
      </form>
    </section>
  );
};

export default RecipeForm;
