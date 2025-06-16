
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

// Helper function to parse ingredient strings into quantity, unit, and ingredient
const parseIngredient = (ingredientText: string) => {
  // Remove common bullet points and clean the text
  const cleaned = ingredientText.replace(/^[-•*\d.)\s]+/, '').trim();
  
  // Regular expression to match quantity, unit, and ingredient
  // Matches patterns like: "2 cups flour", "1/2 tsp salt", "3 large eggs", "200g butter"
  const match = cleaned.match(/^(\d+(?:\/\d+)?(?:\.\d+)?)\s*([a-zA-Z]*)\s+(.+)$/);
  
  if (match) {
    const [, quantity, unit, ingredient] = match;
    return {
      quantity: quantity.trim(),
      unit: unit.trim() || null,
      ingredient: ingredient.trim()
    };
  }
  
  // Try to match just quantity and ingredient (no unit)
  const quantityMatch = cleaned.match(/^(\d+(?:\/\d+)?(?:\.\d+)?)\s+(.+)$/);
  if (quantityMatch) {
    const [, quantity, ingredient] = quantityMatch;
    return {
      quantity: quantity.trim(),
      unit: null,
      ingredient: ingredient.trim()
    };
  }
  
  // If no quantity found, return the whole thing as ingredient
  return {
    quantity: null,
    unit: null,
    ingredient: cleaned
  };
};

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
        quantity: string | null;
        unit: string | null;
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
              
              // Parse the ingredient line to extract quantity, unit, and ingredient
              const parsedIngredient = parseIngredient(line);
              
              if (parsedIngredient.ingredient && parsedIngredient.ingredient.length > 2) {
                ingredients.push({
                  shopping_list_id: shoppingList.id,
                  ingredient: parsedIngredient.ingredient,
                  quantity: parsedIngredient.quantity,
                  unit: parsedIngredient.unit,
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
