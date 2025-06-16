
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Share, Eye } from "lucide-react";
import RecipeViewModal from "./RecipeViewModal";
import RecipeShareModal from "./RecipeShareModal";

interface Recipe {
  id: string;
  title: string;
  analysis: string | null;
  created_at: string;
  updated_at: string;
}

interface RecipeGridProps {
  recipes: Recipe[];
  loading: boolean;
  onDeleteRecipe: (recipeId: string) => void;
  onRefresh: () => void;
}

const RecipeGrid: React.FC<RecipeGridProps> = ({
  recipes,
  loading,
  onDeleteRecipe,
  onRefresh,
}) => {
  const [viewingRecipe, setViewingRecipe] = React.useState<Recipe | null>(null);
  const [sharingRecipe, setSharingRecipe] = React.useState<Recipe | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No recipes yet
          </h3>
          <p className="text-gray-500 mb-4">
            Start by converting your first recipe!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-emerald-800 line-clamp-2">
                {recipe.title}
              </CardTitle>
              <p className="text-sm text-gray-500">
                Created {formatDate(recipe.created_at)}
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingRecipe(recipe)}
                  className="flex items-center gap-1"
                >
                  <Eye size={16} />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSharingRecipe(recipe)}
                  className="flex items-center gap-1"
                >
                  <Share size={16} />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this recipe?")) {
                      onDeleteRecipe(recipe.id);
                    }
                  }}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 size={16} />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <RecipeViewModal
        recipe={viewingRecipe}
        isOpen={!!viewingRecipe}
        onClose={() => setViewingRecipe(null)}
      />

      <RecipeShareModal
        recipe={sharingRecipe}
        isOpen={!!sharingRecipe}
        onClose={() => setSharingRecipe(null)}
        onRefresh={onRefresh}
      />
    </>
  );
};

export default RecipeGrid;
