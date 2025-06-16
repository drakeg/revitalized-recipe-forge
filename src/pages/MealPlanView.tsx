import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Plus, ArrowLeft, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import AddRecipeToMealPlanModal from "@/components/meal-planning/AddRecipeToMealPlanModal";
import MealPlanCalendar from "@/components/meal-planning/MealPlanCalendar";

interface MealPlan {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  created_at: string;
}

interface MealPlanViewProps {
  session?: Session | null;
}

const MealPlanView: React.FC<MealPlanViewProps> = ({ session }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
  const [preselectedDate, setPreselectedDate] = useState<string>("");
  const [preselectedMealType, setPreselectedMealType] = useState<string>("");

  useEffect(() => {
    if (!session?.user) {
      navigate("/auth");
      return;
    }
    if (!id) {
      navigate("/meal-planning");
      return;
    }
    fetchMealPlan();
  }, [session, navigate, id]);

  const fetchMealPlan = async () => {
    try {
      const { data, error } = await supabase
        .from("meal_plans")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setMealPlan(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load meal plan: " + error.message,
        variant: "destructive",
      });
      navigate("/meal-planning");
    } finally {
      setLoading(false);
    }
  };

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
        .eq("meal_plan_id", id);

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
          meal_plan_id: id
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50">
        <Navbar loggedIn={!!session} userEmail={session?.user?.email} session={session} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="text-emerald-600 mt-2">Loading meal plan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!mealPlan) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50">
      <Navbar loggedIn={!!session} userEmail={session?.user?.email} session={session} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/meal-planning")}
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
                onClick={handleGenerateShoppingList}
                className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Generate Shopping List
              </Button>
              <Button
                onClick={() => handleAddRecipe()}
                className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Recipe
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Meal Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <MealPlanCalendar 
              mealPlanId={id!} 
              startDate={mealPlan.start_date}
              endDate={mealPlan.end_date}
              onAddRecipe={handleAddRecipe}
            />
          </CardContent>
        </Card>

        <AddRecipeToMealPlanModal
          isOpen={showAddRecipeModal}
          onClose={handleCloseModal}
          mealPlanId={id!}
          startDate={mealPlan.start_date}
          endDate={mealPlan.end_date}
          preselectedDate={preselectedDate}
          preselectedMealType={preselectedMealType}
        />
      </main>
    </div>
  );
};

export default MealPlanView;
