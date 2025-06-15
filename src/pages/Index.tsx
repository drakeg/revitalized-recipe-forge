
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { LogIn, LogOut, BookOpen, Upload, UserPlus, FileText } from "lucide-react";

const steps = [
  {
    icon: <FileText className="text-primary mb-2" size={24} />,
    title: "Paste or Upload",
    text: "Copy/paste your recipe or upload a PDF, DOC, or TXT file.",
  },
  {
    icon: <BookOpen className="text-primary mb-2" size={24} />,
    title: "Add a Title",
    text: "Give your recipe a descriptive title for easy searching.",
  },
  {
    icon: <Upload className="text-primary mb-2" size={24} />,
    title: "Submit",
    text: "Submit your recipe for instant nutritional analysis.",
  },
  {
    icon: <UserPlus className="text-primary mb-2" size={24} />,
    title: "Register (Optional)",
    text: "Sign up to save, track, and organize all your recipes.",
  },
];

const Index = () => {
  // Authentication states would be replaced by Supabase session;
  // for now, use a placeholder "loggedIn" variable (false by default).
  // Later, this will use real authentication/session state.
  const [loggedIn] = useState(false);

  // Recipe form states (to be handled in future by Supabase)
  const [title, setTitle] = useState("");
  const [recipeText, setRecipeText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File input accepted formats
  const acceptedFileTypes = ".pdf,.txt,.doc,.docx,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setRecipeText(""); // Clear textarea when file is selected for clarity
    }
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRecipeText(e.target.value);
    setFile(null); // Clear file when typing in textarea for clarity
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Submission logic placeholder (to be implemented with Supabase)
    setTimeout(() => {
      setIsSubmitting(false);
      setTitle("");
      setRecipeText("");
      setFile(null);
      alert("Recipe submitted! (Functionality coming soon.)");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="w-full border-b bg-card/80 z-10 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <div className="font-bold text-lg tracking-tight text-primary">Revitalized Recipe Forge</div>
          <div className="flex items-center gap-2">
            {!loggedIn ? (
              <>
                <Button variant="outline" size="sm" className="flex items-center gap-1" tabIndex={0}>
                  <LogIn size={16} />
                  Login
                </Button>
                <Button variant="default" size="sm" className="flex items-center gap-1" tabIndex={0}>
                  <UserPlus size={16} />
                  Sign up
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="flex items-center gap-1" tabIndex={0}>
                  <LogOut size={16} />
                  Logout
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1" tabIndex={0}>
                  My Recipes
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-8">
        {/* Recipe Submission Form */}
        <section className="w-full max-w-xl bg-card/70 rounded-lg shadow p-6 mb-10">
          <h1 className="text-3xl font-bold text-center mb-2">Submit a Recipe for Instant Analysis</h1>
          <p className="text-muted-foreground text-center mb-6 text-base">Paste your recipe or upload a file. No account needed!</p>
          <form
            onSubmit={handleFormSubmit}
            className="space-y-5"
            autoComplete="off"
            aria-label="Recipe submission form"
          >
            <div>
              <label htmlFor="recipe-title" className="block font-medium mb-1">
                Recipe Title<span className="text-destructive">*</span>
              </label>
              <input
                id="recipe-title"
                type="text"
                className="input w-full p-2 rounded border mt-1 outline-none bg-background focus:ring-2 ring-primary placeholder:text-muted-foreground"
                placeholder="e.g. Grandma's Apple Pie"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                autoFocus
                maxLength={80}
              />
            </div>
            <div>
              <label htmlFor="recipe-text" className="block font-medium mb-1">
                Paste Recipe Text<span className="text-muted-foreground ml-2">(or use file upload below)</span>
              </label>
              <textarea
                id="recipe-text"
                className="input w-full min-h-[100px] p-2 rounded border mt-1 outline-none bg-background focus:ring-2 ring-primary placeholder:text-muted-foreground"
                placeholder="Paste your recipe here..."
                value={recipeText}
                onChange={handleTextAreaChange}
                disabled={!!file}
                maxLength={4000}
              />
            </div>
            <div>
              <label htmlFor="recipe-file" className="block font-medium mb-1">
                Upload Recipe File
                <span className="text-muted-foreground ml-2">(PDF, DOC, DOCX, TXT)</span>
              </label>
              <input
                id="recipe-file"
                type="file"
                accept={acceptedFileTypes}
                className="block w-full text-sm file:bg-primary file:text-primary-foreground file:rounded file:border-none file:py-2 file:px-4 file:font-medium"
                onChange={handleFileChange}
                disabled={!!recipeText}
              />
              {file && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Selected: <span className="font-medium">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 px-2 py-0 text-xs"
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
              className="w-full font-semibold mt-2"
              type="submit"
              disabled={isSubmitting || (!recipeText && !file) || !title}
            >
              {isSubmitting ? "Submitting..." : "Submit Recipe"}
            </Button>
          </form>
        </section>

        {/* How it Works */}
        <section className="w-full max-w-3xl mb-14">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center">How it Works</h2>
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-6">
            {steps.map((step, idx) => (
              <Card key={idx} className="flex-1 flex flex-col items-center p-6 text-center">
                <div className="mb-3">{step.icon}</div>
                <CardTitle className="mb-1 text-base">{step.title}</CardTitle>
                <CardDescription>{step.text}</CardDescription>
              </Card>
            ))}
          </div>
        </section>
      </main>
      {/* Future: Show user's recipes if logged in */}
    </div>
  );
};

export default Index;

