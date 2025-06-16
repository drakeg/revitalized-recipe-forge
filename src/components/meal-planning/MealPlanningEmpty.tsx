
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChefHat } from "lucide-react";

interface MealPlanningEmptyProps {
  onCreateClick: () => void;
}

const MealPlanningEmpty: React.FC<MealPlanningEmptyProps> = ({ onCreateClick }) => {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <ChefHat className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-emerald-800 mb-2">
          No meal plans yet
        </h3>
        <p className="text-emerald-600 mb-4">
          Create your first meal plan to get started with organized meal planning!
        </p>
        <Button
          onClick={onCreateClick}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          Create Your First Meal Plan
        </Button>
      </CardContent>
    </Card>
  );
};

export default MealPlanningEmpty;
