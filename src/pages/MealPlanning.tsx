
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { useRecipeUserStatus } from "@/hooks/useRecipeUserStatus";
import MealPlanList from "@/components/meal-planning/MealPlanList";
import CreateMealPlanModal from "@/components/meal-planning/CreateMealPlanModal";
import PremiumFeatureGate from "@/components/PremiumFeatureGate";
import MealPlanningHeader from "@/components/meal-planning/MealPlanningHeader";
import MealPlanningActions from "@/components/meal-planning/MealPlanningActions";
import MealPlanningEmpty from "@/components/meal-planning/MealPlanningEmpty";
import MealPlanningLoadingState from "@/components/meal-planning/MealPlanningLoadingState";

interface MealPlan {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  created_at: string;
}

interface MealPlanningProps {
  session?: Session | null;
}

const MealPlanning: React.FC<MealPlanningProps> = ({ session }) => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoggedIn, isPaid, loading: statusLoading } = useRecipeUserStatus(session);

  useEffect(() => {
    if (!session?.user) {
      navigate("/auth");
      return;
    }
    fetchMealPlans();
  }, [session, navigate]);

  const fetchMealPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("meal_plans")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMealPlans(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load meal plans: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMealPlan = async (planData: { title: string; description: string; start_date: string; end_date: string }) => {
    try {
      const { data, error } = await supabase
        .from("meal_plans")
        .insert([{
          user_id: session!.user.id,
          ...planData
        }])
        .select()
        .single();

      if (error) throw error;

      setMealPlans([data, ...mealPlans]);
      setShowCreateModal(false);
      toast({
        title: "Success",
        description: "Meal plan created successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create meal plan: " + error.message,
        variant: "destructive",
      });
    }
  };

  // Redirect to auth if not logged in
  if (!session?.user) {
    return null;
  }

  // Show loading state while checking user status
  if (statusLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50">
        <Navbar loggedIn={!!session} userEmail={session?.user?.email} session={session} />
        <div className="container mx-auto px-4 py-8">
          <MealPlanningLoadingState message="Checking your subscription status..." />
        </div>
      </div>
    );
  }

  // Show premium gate if user is logged in but not paid
  if (isLoggedIn && !isPaid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50">
        <Navbar loggedIn={!!session} userEmail={session?.user?.email} session={session} />
        <PremiumFeatureGate 
          featureName="Meal Planning"
          description="Plan your meals for the week, organize your cooking schedule, and create shopping lists automatically from your meal plans."
        />
      </div>
    );
  }

  // Main content for paid users
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50">
      <Navbar loggedIn={!!session} userEmail={session?.user?.email} session={session} />
      
      <main className="container mx-auto px-4 py-8">        
        <MealPlanningHeader />

        <MealPlanningActions 
          mealPlansCount={mealPlans.length}
          onCreateClick={() => setShowCreateModal(true)}
        />

        {loading ? (
          <MealPlanningLoadingState message="Loading meal plans..." />
        ) : mealPlans.length === 0 ? (
          <MealPlanningEmpty onCreateClick={() => setShowCreateModal(true)} />
        ) : (
          <MealPlanList 
            mealPlans={mealPlans} 
            onRefresh={fetchMealPlans}
          />
        )}

        <CreateMealPlanModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateMealPlan}
        />
      </main>
    </div>
  );
};

export default MealPlanning;
