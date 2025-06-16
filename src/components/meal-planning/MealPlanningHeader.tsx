
import React from "react";
import { Calendar } from "lucide-react";

const MealPlanningHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-emerald-800 mb-2 flex items-center gap-2">
        <Calendar className="w-8 h-8" />
        Meal Planning
      </h1>
      <p className="text-emerald-600">
        Plan your meals for the week and generate shopping lists
      </p>
    </div>
  );
};

export default MealPlanningHeader;
