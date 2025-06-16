
import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, ArrowLeft, ShoppingCart } from "lucide-react";

interface MealPlan {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  created_at: string;
}

interface MealPlanHeaderProps {
  mealPlan: MealPlan;
  onBack: () => void;
  onAddRecipe: () => void;
  onGenerateShoppingList: () => void;
}

const MealPlanHeader: React.FC<MealPlanHeaderProps> = ({
  mealPlan,
  onBack,
  onAddRecipe,
  onGenerateShoppingList,
}) => {
  return (
    <div className="mb-6">
      <Button
        variant="outline"
        onClick={onBack}
        className="mb-4 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Meal Plans
      </Button>
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-emerald-800 mb-2 flex items-center gap-2">
            <Calendar className="w-8 h-8" />
            {mealPlan.title}
          </h1>
          {mealPlan.description && (
            <p className="text-emerald-600 mb-2">{mealPlan.description}</p>
          )}
          <p className="text-emerald-700">
            {format(new Date(mealPlan.start_date), "MMM d, yyyy")} - {format(new Date(mealPlan.end_date), "MMM d, yyyy")}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={onGenerateShoppingList}
            className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Generate Shopping List
          </Button>
          <Button
            onClick={onAddRecipe}
            className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Recipe
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MealPlanHeader;
