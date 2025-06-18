import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import RecipeCard from "./RecipeCard";
import RecipeFilters from "./RecipeFilters";
import RecipeViewModal from "./RecipeViewModal";
import RecipeShareModal from "./RecipeShareModal";
import AddToShoppingListModal from "./AddToShoppingListModal";
import RecipeCategoryManager from "./RecipeCategoryManager";

interface Recipe {
  id: string;
  title: string;
  analysis: string | null;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface RecipeGridProps {
  recipes: Recipe[];
  loading: boolean;
  onDeleteRecipe: (recipeId: string) => void;
  onRefresh: () => void;
  session?: any;
  onEdit?: (recipe: Recipe) => void;
}

const RecipeGrid: React.FC<RecipeGridProps> = ({
  recipes,
  loading,
  onDeleteRecipe,
  onRefresh,
  session,
  onEdit,
}) => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [shareRecipe, setShareRecipe] = useState<Recipe | null>(null);
  const [categoryManagerRecipe, setCategoryManagerRecipe] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [recipeCategories, setRecipeCategories] = useState<Record<string, Category[]>>({});
  const [recipeRatings, setRecipeRatings] = useState<Record<string, { average: number; count: number }>>({});

  // State for Add To Shopping List Modal
  const [showAddToShoppingModal, setShowAddToShoppingModal] = useState(false);
  const [selectedRecipeForShopping, setSelectedRecipeForShopping] = useState<Recipe | null>(null);

  useEffect(() => {
    fetchCategories();
    if (recipes.length > 0) {
      fetchRecipeCategories();
      fetchRecipeRatings();
    }
  }, [recipes]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("recipe_categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchRecipeCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("recipe_category_assignments")
        .select(`
          recipe_id,
          recipe_categories (id, name, color)
        `)
        .in("recipe_id", recipes.map(r => r.id));

      if (error) throw error;

      const categoryMap: Record<string, Category[]> = {};
      data?.forEach((assignment: any) => {
        if (!categoryMap[assignment.recipe_id]) {
          categoryMap[assignment.recipe_id] = [];
        }
        categoryMap[assignment.recipe_id].push(assignment.recipe_categories);
      });

      setRecipeCategories(categoryMap);
    } catch (error: any) {
      console.error("Failed to fetch recipe categories:", error);
    }
  };

  const fetchRecipeRatings = async () => {
    try {
      const ratingsPromises = recipes.map(async (recipe) => {
        const { data, error } = await supabase
          .rpc("get_recipe_rating_stats", { recipe_id_param: recipe.id });

        if (error) throw error;

        return {
          recipeId: recipe.id,
          average: data?.[0]?.average_rating || 0,
          count: data?.[0]?.total_ratings || 0,
        };
      });

      const ratingsData = await Promise.all(ratingsPromises);
      const ratingsMap: Record<string, { average: number; count: number }> = {};
      
      ratingsData.forEach(({ recipeId, average, count }) => {
        ratingsMap[recipeId] = { average, count };
      });

      setRecipeRatings(ratingsMap);
    } catch (error: any) {
      console.error("Failed to fetch recipe ratings:", error);
    }
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
      recipeCategories[recipe.id]?.some(cat => cat.id === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
  };

  const handleAddToShoppingList = (recipe: Recipe) => {
    setSelectedRecipeForShopping(recipe);
    setShowAddToShoppingModal(true);
  };

  return (
    <>
      <RecipeFilters
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        categories={categories}
        filteredCount={filteredRecipes.length}
        totalCount={recipes.length}
        onSearchChange={setSearchTerm}
        onCategoryChange={setSelectedCategory}
        onClearFilters={clearFilters}
      />

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            categories={recipeCategories[recipe.id] || []}
            rating={recipeRatings[recipe.id] || { average: 0, count: 0 }}
            onView={setSelectedRecipe}
            onEdit={onEdit}
            onShare={setShareRecipe}
            onDelete={onDeleteRecipe}
            onAddToShoppingList={session ? handleAddToShoppingList : undefined}
            onManageCategories={setCategoryManagerRecipe}
            session={session}
          />
        ))}
      </div>

      {filteredRecipes.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-emerald-600 text-lg">
            {searchTerm || selectedCategory !== "all"
              ? "No recipes match your current filters" 
              : "No recipes found"
            }
          </p>
          {(searchTerm || selectedCategory !== "all") && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="mt-4"
            >
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Modals */}
      {selectedRecipe && (
        <RecipeViewModal
          recipe={selectedRecipe}
          isOpen={true}
          onClose={() => setSelectedRecipe(null)}
          session={session}
        />
      )}

      {shareRecipe && (
        <RecipeShareModal
          recipe={shareRecipe}
          isOpen={true}
          onClose={() => setShareRecipe(null)}
          onRefresh={onRefresh}
        />
      )}

      {categoryManagerRecipe && (
        <RecipeCategoryManager
          recipeId={categoryManagerRecipe}
          isOpen={true}
          onClose={() => setCategoryManagerRecipe(null)}
          onUpdate={() => {
            fetchRecipeCategories();
            onRefresh();
          }}
        />
      )}

      {/* Add To Shopping List Modal */}
      {session && (
        <AddToShoppingListModal
          isOpen={showAddToShoppingModal}
          onClose={() => setShowAddToShoppingModal(false)}
          recipe={selectedRecipeForShopping}
          session={session}
        />
      )}
    </>
  );
};

export default RecipeGrid;
