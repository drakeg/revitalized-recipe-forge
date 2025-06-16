
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
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

export const useMealPlanActions = (
  mealPlan: MealPlan | null,
  session: Session | null,
  mealPlanId: string
) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
  const [preselectedDate, setPreselectedDate] = useState<string>("");
  const [preselectedMealType, setPreselectedMealType] = useState<string>("");

  const handleAddRecipe = (date?: string, mealType?: string) => {
    if (date && mealType) {
      setPreselectedDate(date);
      setPreselectedMealType(mealType);
    } else {
      setPreselectedDate("");
      setPreselectedMealType("");
    }
    setShowAddRecipeModal(true);
  };

  const handleCloseModal = () => {
    setShowAddRecipeModal(false);
    setPreselectedDate("");
    setPreselectedMealType("");
  };

  const handleGenerateShoppingList = async () => {
    try {
      // Get all meal plan items for this plan
      const { data: mealPlanItems, error: itemsError } = await supabase
        .from("meal_plan_items")
        .select(`
          *,
          recipes!inner(*)
        `)
        .eq("meal_plan_id", mealPlanId);

      if (itemsError) throw itemsError;

      if (!mealPlanItems || mealPlanItems.length === 0) {
        toast({
          title: "No recipes",
          description: "Add some recipes to your meal plan first!",
          variant: "destructive",
        });
        return;
      }

      // Create shopping list
      const { data: shoppingList, error: listError } = await supabase
        .from("shopping_lists")
        .insert([{
          user_id: session!.user.id,
          title: `Shopping for ${mealPlan?.title}`,
          meal_plan_id: mealPlanId
        }])
        .select()
        .single();

      if (listError) throw listError;

      // Extract ingredients from all recipes and add to shopping list
      const ingredients: Array<{
        shopping_list_id: string;
        ingredient: string;
        recipe_id: string;
      }> = [];

      mealPlanItems.forEach((item: any) => {
        if (item.recipes?.analysis) {
          // Parse ingredients from recipe analysis
          const lines = item.recipes.analysis.split('\n');
          const ingredientSection = lines.findIndex(line => 
            line.toLowerCase().includes('ingredients') || 
            line.toLowerCase().includes('ingredient')
          );
          
          if (ingredientSection !== -1) {
            for (let i = ingredientSection + 1; i < lines.length; i++) {
              const line = lines[i].trim();
              if (!line) continue;
              if (line.toLowerCase().includes('instructions') || 
                  line.toLowerCase().includes('direction')) break;
              
              // Clean up ingredient line (remove bullets, numbers, etc.)
              const cleanIngredient = line.replace(/^[-•*\d.)\s]+/, '').trim();
              if (cleanIngredient && cleanIngredient.length > 2) {
                ingredients.push({
                  shopping_list_id: shoppingList.id,
                  ingredient: cleanIngredient,
                  recipe_id: item.recipes.id
                });
              }
            }
          }
        }
      });

      if (ingredients.length > 0) {
        const { error: itemsError } = await supabase
          .from("shopping_list_items")
          .insert(ingredients);

        if (itemsError) throw itemsError;
      }

      toast({
        title: "Success",
        description: "Shopping list generated successfully!",
      });

      navigate("/shopping-lists");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate shopping list: " + error.message,
        variant: "destructive",
      });
    }
  };

  return {
    showAddRecipeModal,
    preselectedDate,
    preselectedMealType,
    handleAddRecipe,
    handleCloseModal,
    handleGenerateShoppingList,
  };
};
