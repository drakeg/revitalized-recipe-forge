
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import RecipeGrid from "@/components/dashboard/RecipeGrid";
import DashboardStats from "@/components/dashboard/DashboardStats";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ShoppingCart, User, Crown, Settings, Plus } from "lucide-react";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useProfileData } from "@/hooks/useProfileData";
import ProfileForm from "@/components/profile/ProfileForm";
import SubscriptionManager from "@/components/SubscriptionManager";
import PremiumFeatureGate from "@/components/PremiumFeatureGate";

interface Recipe {
  id: string;
  title: string;
  analysis: string | null;
  created_at: string;
  updated_at: string;
}

interface MealPlan {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  created_at: string;
}

interface ShoppingList {
  id: string;
  title: string;
  created_at: string;
  meal_plan_id: string | null;
}

interface DashboardProps {
  session?: Session | null;
}

const Dashboard: React.FC<DashboardProps> = ({ session }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { subscribed: isPaid, loading: subscriptionLoading, refreshSubscription } = useSubscriptionStatus(session);
  const {
    loading: profileLoading,
    saving,
    formData,
    handleInputChange,
    handleSave,
  } = useProfileData(session);

  useEffect(() => {
    if (!session?.user) {
      navigate("/auth");
      return;
    }
    fetchData();
  }, [session, navigate]);

  const fetchData = async () => {
    try {
      // Fetch recipes
      const { data: recipesData, error: recipesError } = await supabase
        .from("recipes")
        .select("id, title, analysis, created_at, updated_at")
        .order("created_at", { ascending: false });

      if (recipesError) throw recipesError;
      setRecipes(recipesData || []);

      // Fetch meal plans if user is paid
      if (isPaid) {
        const { data: mealPlansData, error: mealPlansError } = await supabase
          .from("meal_plans")
          .select("*")
          .eq("user_id", session?.user?.id)
          .order("created_at", { ascending: false })
          .limit(3);

        if (mealPlansError) throw mealPlansError;
        setMealPlans(mealPlansData || []);

        // Fetch shopping lists if user is paid
        const { data: shoppingListsData, error: shoppingListsError } = await supabase
          .from("shopping_lists")
          .select("*")
          .eq("user_id", session?.user?.id)
          .order("created_at", { ascending: false })
          .limit(3);

        if (shoppingListsError) throw shoppingListsError;
        setShoppingLists(shoppingListsData || []);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditRecipe = (recipe: Recipe) => {
    navigate("/");
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    try {
      const { error } = await supabase
        .from("recipes")
        .delete()
        .eq("id", recipeId);

      if (error) throw error;

      setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
      toast({
        title: "Success",
        description: "Recipe deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete recipe: " + error.message,
        variant: "destructive",
      });
    }
  };

  if (!session?.user) {
    return null;
  }

  if (loading || subscriptionLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50">
        <Navbar loggedIn={!!session} userEmail={session.user.email} session={session} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="text-emerald-600 mt-2">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50">
      <Navbar loggedIn={!!session} userEmail={session.user.email} session={session} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-800 mb-2">
            Dashboard
          </h1>
          <p className="text-emerald-600">
            Your complete recipe management hub
          </p>
        </div>

        {/* Recipe Stats */}
        <DashboardStats recipes={recipes} />

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Meal Plans Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Meal Plans
                {!isPaid && <Crown className="w-4 h-4 text-yellow-600" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPaid ? (
                <div className="space-y-4">
                  {mealPlans.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No meal plans yet</p>
                  ) : (
                    <div className="space-y-3">
                      {mealPlans.map((plan) => (
                        <div key={plan.id} className="p-3 border border-emerald-200 rounded-lg">
                          <h4 className="font-medium text-emerald-800">{plan.title}</h4>
                          <p className="text-sm text-emerald-600">
                            {new Date(plan.start_date).toLocaleDateString()} - {new Date(plan.end_date).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigate("/meal-planning")}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2"
                      size="sm"
                    >
                      <Plus className="w-4 h-4" />
                      Create Meal Plan
                    </Button>
                    <Button
                      onClick={() => navigate("/meal-planning")}
                      variant="outline"
                      size="sm"
                    >
                      View All
                    </Button>
                  </div>
                </div>
              ) : (
                <PremiumFeatureGate
                  featureName="Meal Planning"
                  description="Plan your meals for the week and organize your cooking schedule."
                />
              )}
            </CardContent>
          </Card>

          {/* Shopping Lists Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Recent Shopping Lists
                {!isPaid && <Crown className="w-4 h-4 text-yellow-600" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPaid ? (
                <div className="space-y-4">
                  {shoppingLists.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No shopping lists yet</p>
                  ) : (
                    <div className="space-y-3">
                      {shoppingLists.map((list) => (
                        <div key={list.id} className="p-3 border border-emerald-200 rounded-lg">
                          <h4 className="font-medium text-emerald-800">{list.title}</h4>
                          <p className="text-sm text-emerald-600">
                            Created {new Date(list.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigate("/shopping-lists")}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2"
                      size="sm"
                    >
                      <Plus className="w-4 h-4" />
                      Create Shopping List
                    </Button>
                    <Button
                      onClick={() => navigate("/shopping-lists")}
                      variant="outline"
                      size="sm"
                    >
                      View All
                    </Button>
                  </div>
                </div>
              ) : (
                <PremiumFeatureGate
                  featureName="Shopping Lists"
                  description="Create and manage your shopping lists with automatic ingredient organization."
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Account Management Section */}
        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm
                formData={formData}
                saving={saving}
                onInputChange={handleInputChange}
                onSubmit={handleSave}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Subscription Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPaid ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Crown className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Premium Subscriber</span>
                  </div>
                  <SubscriptionManager 
                    isPaid={isPaid} 
                    onRefreshStatus={refreshSubscription} 
                  />
                </div>
              ) : (
                <PremiumFeatureGate
                  featureName="Subscription Management"
                  description="Manage your subscription, billing, and premium features."
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recipes Section */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-emerald-800">
            Your Recipes ({recipes.length})
          </h2>
          <Button
            onClick={() => navigate("/")}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Convert New Recipe
          </Button>
        </div>

        <RecipeGrid 
          recipes={recipes} 
          loading={loading} 
          onDeleteRecipe={handleDeleteRecipe}
          onRefresh={fetchData}
          session={session}
          onEdit={handleEditRecipe}
        />
      </main>
    </div>
  );
};

export default Dashboard;
