
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MealPlan {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  created_at: string;
}

interface MealPlanListProps {
  mealPlans: MealPlan[];
  onRefresh: () => void;
}

const MealPlanList: React.FC<MealPlanListProps> = ({ mealPlans, onRefresh }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this meal plan?")) return;

    try {
      const { error } = await supabase
        .from("meal_plans")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meal plan deleted successfully",
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete meal plan: " + error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mealPlans.map((plan) => (
        <Card key={plan.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-800">
              <Calendar className="w-5 h-5" />
              {plan.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {plan.description && (
              <p className="text-gray-600 text-sm">{plan.description}</p>
            )}
            <div className="text-sm text-emerald-600">
              <p>Start: {format(new Date(plan.start_date), "MMM d, yyyy")}</p>
              <p>End: {format(new Date(plan.end_date), "MMM d, yyyy")}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/meal-plan/${plan.id}`)}
                className="flex-1 flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(plan.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MealPlanList;
