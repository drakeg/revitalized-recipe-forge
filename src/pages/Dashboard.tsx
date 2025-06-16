import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import RecipeGrid from "@/components/dashboard/RecipeGrid";
import DashboardStats from "@/components/dashboard/DashboardStats";
import { useToast } from "@/hooks/use-toast";

interface Recipe {
  id: string;
  title: string;
  analysis: string | null;
  created_at: string;
  updated_at: string;
}

interface DashboardProps {
  session?: Session | null;
}

const Dashboard: React.FC<DashboardProps> = ({ session }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!session?.user) {
      navigate("/auth");
      return;
    }
    fetchRecipes();
  }, [session, navigate]);

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from("recipes")
        .select("id, title, analysis, created_at, updated_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load recipes: " + error.message,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50">
      <Navbar loggedIn={!!session} userEmail={session.user.email} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-800 mb-2">
            Recipe Dashboard
          </h1>
          <p className="text-emerald-600">
            Manage your converted recipes and discover new favorites
          </p>
        </div>

        <DashboardStats recipes={recipes} />

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-emerald-800">
            Your Recipes ({recipes.length})
          </h2>
          <button
            onClick={() => navigate("/")}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Convert New Recipe
          </button>
        </div>

        <RecipeGrid 
          recipes={recipes} 
          loading={loading} 
          onDeleteRecipe={handleDeleteRecipe}
          onRefresh={fetchRecipes}
          session={session}
          onEdit={handleEditRecipe}
        />
      </main>
    </div>
  );
};

export default Dashboard;
