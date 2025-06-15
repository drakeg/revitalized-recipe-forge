
import React from "react";
import RecipeAnalysisResult from "./RecipeAnalysisResult";
import RecipeFormActions from "./RecipeFormActions";

interface RecipeResultSectionProps {
  analysis: string;
  saveSuccess: string | null;
  saving: boolean;
  onConvertAnother: () => void;
  onSave: () => void;
  userIsLoggedIn: boolean;
  userIsPaid: boolean;
}

const RecipeResultSection: React.FC<RecipeResultSectionProps> = ({
  analysis,
  saveSuccess,
  saving,
  onConvertAnother,
  onSave,
  userIsLoggedIn,
  userIsPaid,
}) => (
  <>
    <RecipeAnalysisResult result={analysis} />
    <RecipeFormActions
      userIsLoggedIn={userIsLoggedIn}
      userIsPaid={userIsPaid}
      saving={saving}
      saveSuccess={saveSuccess}
      onConvertAnother={onConvertAnother}
      onSave={onSave}
    />
  </>
);

export default RecipeResultSection;
