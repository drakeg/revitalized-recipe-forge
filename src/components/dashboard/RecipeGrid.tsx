import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, Share2, Search, Plus, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import RecipeViewModal from "./RecipeViewModal";
import RecipeShareModal from "./RecipeShareModal";
import AddToShoppingListModal from "./AddToShoppingListModal";

// ... keep existing code (interfaces and component start)

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
  session: any;
  onEdit: (recipe: Recipe) => void;
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
  const { toast } = useToast();

  // State for Add To Shopping List Modal
  const [showAddToShoppingModal, setShowAddToShoppingModal] = useState(false);
  const [selectedRecipeForShopping, setSelectedRecipeForShopping] = useState<Recipe | null>(null);

  useEffect(() => {
    fetchCategories();
    if (recipes.length > 0) {
      fetchRecipeCategories();
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

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleShareRecipe = (recipe: Recipe) => {
    setShareRecipe(recipe);
  };

  const handleDeleteRecipe = (recipeId: string) => {
    onDeleteRecipe(recipeId);
  };

  const handleAddToShoppingList = (recipe: Recipe) => {
    setSelectedRecipeForShopping(recipe);
    setShowAddToShoppingModal(true);
  };

  return (
    <>
      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {(searchTerm || selectedCategory !== "all") && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Showing {filteredRecipes.length} of {recipes.length} recipes
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-emerald-600 hover:text-emerald-700"
            >
              <X className="w-4 h-4 mr-1" />
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-emerald-800 flex items-start justify-between">
                <span>{recipe.title}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCategoryManagerRecipe(recipe.id)}
                  className="text-emerald-600 hover:text-emerald-700 ml-2"
                >
                  <Tag className="w-4 h-4" />
                </Button>
              </CardTitle>
              {recipeCategories[recipe.id] && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {recipeCategories[recipe.id].map((category) => (
                    <Badge 
                      key={category.id} 
                      variant="secondary"
                      className="text-xs"
                      style={{ 
                        backgroundColor: category.color + '20', 
                        color: category.color,
                        borderColor: category.color + '40'
                      }}
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-emerald-600">
                Created {format(new Date(recipe.created_at), "MMM d, yyyy")}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewRecipe(recipe)}
                  className="flex-1 flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(recipe)}
                  className="flex items-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShareRecipe(recipe)}
                  className="flex items-center gap-1"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddToShoppingList(recipe)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to List
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteRecipe(recipe.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
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
      <AddToShoppingListModal
        isOpen={showAddToShoppingModal}
        onClose={() => setShowAddToShoppingModal(false)}
        recipe={selectedRecipeForShopping}
        session={session}
      />
    </>
  );
};

export default RecipeGrid;
