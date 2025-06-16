
import React from "react";

interface RecipeFormErrorProps {
  error: React.ReactNode | null;
}

const RecipeFormError: React.FC<RecipeFormErrorProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="mt-4 text-center text-destructive text-sm font-semibold">
      {error}
    </div>
  );
};

export default RecipeFormError;
