
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, eachDayOfInterval, parseISO } from "date-fns";
import { Trash2, Eye } from "lucide-react";
import RecipeViewModal from "@/components/dashboard/RecipeViewModal";

interface MealPlanItem {
  id: string;
  meal_date: string;
  meal_type: string;
  servings: number;
  recipes: {
    id: string;
    title: string;
    analysis: string | null;
    created_at: string;
    updated_at: string;
  };
}

interface MealPlanCalendarProps {
  mealPlanId: string;
  startDate: string;
  endDate: string;
}

const MealPlanCalendar: React.FC<MealPlanCalendarProps> = ({
  mealPlanId,
  startDate,
  endDate,
}) => {
  const [mealPlanItems, setMealPlanItems] = useState<MealPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const { toast } = useToast();

  const dates = eachDayOfInterval({
    start: parseISO(startDate),
    end: parseISO(endDate),
  });

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  useEffect(() => {
    fetchMealPlanItems();
  }, [mealPlanId]);

  const fetchMealPlanItems = async () => {
    try {
      const { data, error } = await supabase
        .from("meal_plan_items")
        .select(`
          *,
          recipes!inner(*)
        `)
        .eq("meal_plan_id", mealPlanId)
        .order("meal_date", { ascending: true });

      if (error) throw error;
      setMealPlanItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load meal plan items: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to remove this recipe from your meal plan?")) return;

    try {
      const { error } = await supabase
        .from("meal_plan_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      setMealPlanItems(items => items.filter(item => item.id !== itemId));
      toast({
        title: "Success",
        description: "Recipe removed from meal plan",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to remove recipe: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleViewRecipe = (recipe: any) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
  };

  const getMealsForDateAndType = (date: Date, mealType: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return mealPlanItems.filter(item => 
      item.meal_date === dateStr && item.meal_type === mealType
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
        <p className="text-emerald-600 mt-2">Loading meal plan...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {dates.map((date) => (
          <Card key={date.toISOString()}>
            <CardHeader>
              <CardTitle className="text-lg">
                {format(date, 'EEEE, MMMM d, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {mealTypes.map((mealType) => {
                  const meals = getMealsForDateAndType(date, mealType);
                  return (
                    <div key={mealType} className="border rounded-lg p-3">
                      <h4 className="font-semibold text-emerald-800 mb-2 capitalize">
                        {mealType}
                      </h4>
                      {meals.length === 0 ? (
                        <p className="text-gray-500 text-sm italic">No meals planned</p>
                      ) : (
                        <div className="space-y-2">
                          {meals.map((meal) => (
                            <div key={meal.id} className="bg-emerald-50 p-2 rounded border">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{meal.recipes.title}</p>
                                  <p className="text-xs text-gray-600">Servings: {meal.servings}</p>
                                </div>
                                <div className="flex gap-1 ml-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewRecipe(meal.recipes)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteItem(meal.id)}
                                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <RecipeViewModal
        recipe={selectedRecipe}
        isOpen={showRecipeModal}
        onClose={() => setShowRecipeModal(false)}
      />
    </>
  );
};

export default MealPlanCalendar;
