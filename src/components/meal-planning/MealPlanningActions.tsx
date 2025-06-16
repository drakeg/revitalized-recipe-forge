
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface MealPlanningActionsProps {
  mealPlansCount: number;
  onCreateClick: () => void;
}

const MealPlanningActions: React.FC<MealPlanningActionsProps> = ({
  mealPlansCount,
  onCreateClick,
}) => {
  return (
    <div className="mb-6 flex justify-between items-center">
      <h2 className="text-2xl font-semibold text-emerald-800">
        Your Meal Plans ({mealPlansCount})
      </h2>
      <Button
        onClick={onCreateClick}
        className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Create Meal Plan
      </Button>
    </div>
  );
};

export default MealPlanningActions;
