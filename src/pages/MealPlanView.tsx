
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import AddRecipeToMealPlanModal from "@/components/meal-planning/AddRecipeToMealPlanModal";
import MealPlanCalendar from "@/components/meal-planning/MealPlanCalendar";
import MealPlanHeader from "@/components/meal-planning/MealPlanHeader";
import { useMealPlanActions } from "@/hooks/useMealPlanActions";

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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const {
    showAddRecipeModal,
    preselectedDate,
    preselectedMealType,
    handleAddRecipe,
    handleCloseModal,
    handleGenerateShoppingList,
  } = useMealPlanActions(mealPlan, session, id!);

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

  const handleRecipeAdded = () => {
    // Trigger a refresh of the calendar
    setRefreshTrigger(prev => prev + 1);
  };

  const handleModalClose = () => {
    handleCloseModal();
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
        <MealPlanHeader
          mealPlan={mealPlan}
          onBack={() => navigate("/meal-planning")}
          onAddRecipe={() => handleAddRecipe()}
          onGenerateShoppingList={handleGenerateShoppingList}
        />

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
              refreshTrigger={refreshTrigger}
            />
          </CardContent>
        </Card>

        <AddRecipeToMealPlanModal
          isOpen={showAddRecipeModal}
          onClose={handleModalClose}
          mealPlanId={id!}
          startDate={mealPlan.start_date}
          endDate={mealPlan.end_date}
          preselectedDate={preselectedDate}
          preselectedMealType={preselectedMealType}
          onRecipeAdded={handleRecipeAdded}
        />
      </main>
    </div>
  );
};

export default MealPlanView;
