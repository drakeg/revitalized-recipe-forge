
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { parseRecipeMarkdown } from "@/lib/parseRecipeMarkdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecipeReviews from "@/components/rating/RecipeReviews";
import StarRating from "@/components/rating/StarRating";
import { useToast } from "@/hooks/use-toast";

interface Recipe {
  id: string;
  title: string;
  analysis: string | null;
  created_at: string;
  updated_at: string;
}

const RecipeView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchRecipe();
      fetchRatingStats();
    }
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setRecipe(data);
    } catch (error: any) {
      console.error("Failed to fetch recipe:", error);
      toast({
        title: "Error",
        description: "Recipe not found",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchRatingStats = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .rpc("get_recipe_rating_stats", { recipe_id_param: id });

      if (error) throw error;

      if (data && data[0]) {
        setAverageRating(data[0].average_rating || 0);
        setTotalRatings(data[0].total_ratings || 0);
      }
    } catch (error: any) {
      console.error("Failed to fetch rating stats:", error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: recipe?.title,
        text: `Check out this amazing recipe: ${recipe?.title}`,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Copied!",
          description: "Recipe link copied to clipboard",
        });
      } catch (clipboardError) {
        toast({
          title: "Error",
          description: "Failed to share recipe",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-yellow-50 flex items-center justify-center">
        <div className="text-emerald-700 text-lg">Loading recipe...</div>
      </div>
    );
  }

  if (!recipe || !recipe.analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-emerald-700 text-lg">Recipe not found</div>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const { title, ingredients, instructions, nutritionTable } = parseRecipeMarkdown(recipe.analysis);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
          
          <h1 className="text-3xl font-bold text-emerald-800 mb-4">
            {title || recipe.title}
          </h1>
          
          {totalRatings > 0 && (
            <div className="flex items-center gap-4">
              <StarRating
                rating={averageRating}
                readonly
                size="lg"
              />
              <span className="text-lg font-medium text-emerald-700">
                {averageRating.toFixed(1)} ({totalRatings} review{totalRatings !== 1 ? 's' : ''})
              </span>
            </div>
          )}
        </div>

        {/* Recipe Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <Tabs defaultValue="recipe" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recipe">Recipe</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recipe" className="p-6 space-y-8">
              {/* Ingredients */}
              {ingredients.length > 0 && (
                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-green-900">Ingredients</h2>
                  <ul className="list-disc ml-6 text-green-800 space-y-2 text-lg">
                    {ingredients.map((ingredient, i) => (
                      <li key={i}>{ingredient}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Instructions */}
              {instructions.length > 0 && (
                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-yellow-900">Instructions</h2>
                  <ol className="list-decimal ml-6 text-yellow-900 space-y-3 text-lg">
                    {instructions.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </section>
              )}

              {/* Nutrition Table */}
              {nutritionTable && (
                <section>
                  <h2 className="text-xl font-semibold uppercase tracking-wide text-lime-700 mb-4">
                    Nutrition Facts
                  </h2>
                  <div className="overflow-x-auto rounded border border-lime-300 bg-lime-50 p-4">
                    <table className="min-w-[280px] w-auto border-collapse font-mono text-lime-900">
                      <thead>
                        <tr>
                          {nutritionTable.headers.map((header, i) => (
                            <th
                              key={i}
                              className="border-b-2 border-lime-400 pb-2 text-left font-bold text-sm uppercase px-3"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {nutritionTable.rows.map((row, idx) => (
                          <tr key={idx}>
                            {row.map((val, i) => (
                              <td
                                key={i}
                                className="py-2 px-3 text-base font-semibold text-emerald-900"
                              >
                                {val}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </TabsContent>
            
            <TabsContent value="reviews" className="p-6">
              <RecipeReviews recipeId={recipe.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default RecipeView;
