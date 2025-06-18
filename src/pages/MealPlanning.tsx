
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import Navbar from "@/components/Navbar";
import MealPlanningHeader from "@/components/meal-planning/MealPlanningHeader";
import MealPlanningActions from "@/components/meal-planning/MealPlanningActions";
import MealPlanningEmpty from "@/components/meal-planning/MealPlanningEmpty";
import MealPlanList from "@/components/meal-planning/MealPlanList";
import CreateMealPlanModal from "@/components/meal-planning/CreateMealPlanModal";
import SubscriptionManager from "@/components/SubscriptionManager";

interface MealPlan {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  created_at: string;
}

interface MealPlanningProps {
  session: Session | null;
}

const MealPlanning: React.FC<MealPlanningProps> = ({ session }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscribed: isPaid, loading: subscriptionLoading, refreshSubscription } = useSubscriptionStatus(session);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate("/auth");
      return;
    }

    if (!subscriptionLoading && !isPaid) {
      // Show upgrade prompt but don't redirect immediately
      return;
    }

    if (isPaid) {
      fetchMealPlans();
    }
  }, [session, isPaid, subscriptionLoading, navigate]);

  const fetchMealPlans = async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from("meal_plans")
        .select("*")
        .eq("user_id", session.user.id)
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

  const handleCreateMealPlan = async (data: {
    title: string;
    description: string;
    start_date: string;
    end_date: string;
  }) => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from("meal_plans")
        .insert([
          {
            ...data,
            user_id: session.user.id,
          },
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meal plan created successfully!",
      });

      setShowCreateModal(false);
      fetchMealPlans();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create meal plan: " + error.message,
        variant: "destructive",
      });
    }
  };

  if (!session) {
    return null; // Will redirect to auth
  }

  if (subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-100">
        <Navbar loggedIn={true} userEmail={session.user?.email} session={session} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="text-emerald-600 mt-2">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isPaid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-100">
        <Navbar loggedIn={true} userEmail={session.user?.email} session={session} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-emerald-800 mb-4">Meal Planning</h1>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Premium Feature Required</h2>
              <p className="text-gray-600 mb-6">
                Meal planning is available exclusively to premium subscribers. Upgrade your account to access this feature and unlock:
              </p>
              <ul className="text-left text-gray-700 mb-8 space-y-2">
                <li>✅ Unlimited meal plans</li>
                <li>✅ Weekly meal scheduling</li>
                <li>✅ Shopping list generation</li>
                <li>✅ Recipe organization</li>
                <li>✅ Save unlimited recipes</li>
              </ul>
              <SubscriptionManager 
                isPaid={isPaid} 
                onRefreshStatus={refreshSubscription}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-100">
      <Navbar loggedIn={true} userEmail={session.user?.email} session={session} />
      <div className="container mx-auto px-4 py-8">
        <MealPlanningHeader />
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="text-emerald-600 mt-2">Loading meal plans...</p>
          </div>
        ) : mealPlans.length === 0 ? (
          <>
            <MealPlanningActions
              mealPlansCount={mealPlans.length}
              onCreateClick={() => setShowCreateModal(true)}
            />
            <MealPlanningEmpty onCreateClick={() => setShowCreateModal(true)} />
          </>
        ) : (
          <>
            <MealPlanningActions
              mealPlansCount={mealPlans.length}
              onCreateClick={() => setShowCreateModal(true)}
            />
            <MealPlanList mealPlans={mealPlans} onRefresh={fetchMealPlans} />
          </>
        )}

        <CreateMealPlanModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateMealPlan}
        />
      </div>
    </div>
  );
};

export default MealPlanning;
