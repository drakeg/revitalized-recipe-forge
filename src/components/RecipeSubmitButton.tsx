
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
        <span
          className="relative font-extrabold text-base px-2 py-1"
          style={{
            borderRadius: 8,
            background:
              "linear-gradient(90deg,rgba(255,255,255,0.32)_0%,rgba(255,255,255,0.18)_100%)",
            backdropFilter: "blur(1.5px)",
            WebkitBackdropFilter: "blur(1.5px)",
            boxShadow: "0 1px 4px rgba(180,180,120,0.06)",
            color: "#111",
            textShadow:
              "0 2px 7px rgba(255,255,255,0.7), 0 0px 1px rgba(0,0,0,0.15)",
            fontSize: "1.19rem",
          }}
        >
          Submitting...
        </span>
      </>
    ) : (
      <>
        <Upload className="mr-2" size={20} />
        <span
          className="relative font-extrabold text-base px-2 py-1"
          style={{
            borderRadius: 8,
            background:
              "linear-gradient(90deg,rgba(255,255,255,0.33)_0%,rgba(255,255,255,0.21)_100%)",
            backdropFilter: "blur(1.5px)",
            WebkitBackdropFilter: "blur(1.5px)",
            boxShadow: "0 1px 4px rgba(180,180,120,0.06)",
            color: "#111",
            textShadow:
              "0 2px 7px rgba(255,255,255,0.8), 0 0px 1px rgba(0,0,0,0.18)",
            fontSize: "1.22rem",
          }}
        >
          Submit Recipe
        </span>
      </>
    )}
  </Button>
);

export default RecipeSubmitButton;
