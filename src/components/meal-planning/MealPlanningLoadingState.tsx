
import React from "react";

interface MealPlanningLoadingStateProps {
  message: string;
}

const MealPlanningLoadingState: React.FC<MealPlanningLoadingStateProps> = ({ message }) => {
  return (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
      <p className="text-emerald-600 mt-2">{message}</p>
    </div>
  );
};

export default MealPlanningLoadingState;
