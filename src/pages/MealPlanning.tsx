
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Plus, ChefHat } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRecipeUserStatus } from "@/hooks/useRecipeUserStatus";
import MealPlanList from "@/components/meal-planning/MealPlanList";
import CreateMealPlanModal from "@/components/meal-planning/CreateMealPlanModal";
import PremiumFeatureGate from "@/components/PremiumFeatureGate";

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

  // Debug logging
  console.log("MealPlanning - Debug info:", {
    statusLoading,
    isLoggedIn,
    isPaid,
    sessionExists: !!session,
    userId: session?.user?.id
  });

  useEffect(() => {
    if (!session?.user) {
      navigate("/auth");
      return;
    }
    fetchMealPlans();
  }, [session, navigate]);

  // Show premium gate if user is not paid
  if (!statusLoading && isLoggedIn && !isPaid) {
    console.log("Showing premium gate because: statusLoading=", statusLoading, "isLoggedIn=", isLoggedIn, "isPaid=", isPaid);
    return (
      <>
        <Navbar loggedIn={!!session} userEmail={session?.user?.email} session={session} />
        <PremiumFeatureGate 
          featureName="Meal Planning"
          description="Plan your meals for the week, organize your cooking schedule, and create shopping lists automatically from your meal plans."
        />
      </>
    );
  }

  // Debug: Log when we should show the main content
  console.log("MealPlanning - Should show main content:", {
    condition1: statusLoading, // if true, we're still loading
    condition2: !statusLoading && isLoggedIn && !isPaid, // if true, show premium gate
    condition3: !statusLoading && isLoggedIn && isPaid // if true, show main content
  });

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

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50">
      <Navbar loggedIn={!!session} userEmail={session.user.email} session={session} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-800 mb-2 flex items-center gap-2">
            <Calendar className="w-8 h-8" />
            Meal Planning
          </h1>
          <p className="text-emerald-600">
            Plan your meals for the week and generate shopping lists
          </p>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-emerald-800">
            Your Meal Plans ({mealPlans.length})
          </h2>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Meal Plan
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="text-emerald-600 mt-2">Loading meal plans...</p>
          </div>
        ) : mealPlans.length === 0 ? (
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
                onClick={() => setShowCreateModal(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Create Your First Meal Plan
              </Button>
            </CardContent>
          </Card>
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
