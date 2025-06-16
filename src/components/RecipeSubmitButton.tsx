
import React from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface RecipeSubmitButtonProps {
  isSubmitting: boolean;
  disabled: boolean;
}

const RecipeSubmitButton: React.FC<RecipeSubmitButtonProps> = ({
  isSubmitting,
  disabled,
}) => (
  <Button
    size="lg"
    className="w-full font-semibold mt-2 bg-gradient-to-r from-emerald-500 via-amber-300 to-yellow-300 text-[#111] shadow-[0_2px_8px_rgba(0,0,0,0.11)] rounded-lg hover:from-emerald-600 hover:via-amber-400 hover:to-yellow-400 transition-all drop-shadow"
    type="submit"
    disabled={disabled}
    style={{
      textShadow:
        "0 1.5px 3px rgba(255,255,255,0.7), 0 0px 1px rgba(0,0,0,0.10)",
      border: "2px solid #059669",
      letterSpacing: "0.02em",
      fontWeight: 800,
    }}
  >
    {isSubmitting ? (
      <>
        <Upload className="animate-spin mr-2" size={20} />
        <span className="font-extrabold text-base">
          Submitting...
        </span>
      </>
    ) : (
      <>
        <Upload className="mr-2" size={20} />
        <span className="font-extrabold text-base">
          Submit Recipe
        </span>
      </>
    )}
  </Button>
);

export default RecipeSubmitButton;
