
import React from "react";
import { Button } from "@/components/ui/button";

interface RecipeFormActionsProps {
  userIsLoggedIn: boolean;
  userIsPaid: boolean;
  saving: boolean;
  saveSuccess: string | null;
  onConvertAnother: () => void;
  onSave: () => void;
}

const RecipeFormActions: React.FC<RecipeFormActionsProps> = ({
  userIsLoggedIn,
  userIsPaid,
  saving,
  saveSuccess,
  onConvertAnother,
  onSave,
}) => (
  <>
    {/* Save success banner */}
    {saveSuccess && (
      <div className="w-full text-center mt-2 mb-2">
        <div className="inline-block rounded-lg border border-lime-400 bg-lime-50 px-4 py-2 text-lime-900 font-semibold shadow-sm">
          {saveSuccess}
        </div>
      </div>
    )}
    <div className="w-full flex flex-col sm:flex-row justify-center gap-3 mt-4">
      <Button
        variant="outline"
        className="font-semibold text-emerald-700 px-6 py-2 bg-white/80 hover:bg-yellow-100 border-2 border-emerald-300"
        onClick={onConvertAnother}
      >
        Convert Another Recipe
      </Button>
      {userIsLoggedIn && userIsPaid && (
        <Button
          variant="default"
          className="font-semibold text-white px-6 py-2 bg-emerald-500 hover:bg-emerald-600 border-2 border-emerald-500"
          disabled={saving}
          onClick={onSave}
        >
          {saving ? "Saving..." : "Save to My Recipe Book"}
        </Button>
      )}
      {userIsLoggedIn && !userIsPaid && (
        <span className="flex items-center text-yellow-900 bg-yellow-100 px-4 py-2 rounded-md border border-yellow-300 font-semibold text-sm shadow">
          Paid membership required to save recipes.
        </span>
      )}
    </div>
  </>
);

export default RecipeFormActions;
