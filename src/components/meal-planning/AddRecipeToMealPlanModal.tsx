import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";

interface Recipe {
  id: string;
  title: string;
  created_at: string;
}

interface AddRecipeToMealPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealPlanId: string;
  startDate: string;
  endDate: string;
  preselectedDate?: string;
  preselectedMealType?: string;
}

const AddRecipeToMealPlanModal: React.FC<AddRecipeToMealPlanModalProps> = ({
  isOpen,
  onClose,
  mealPlanId,
  startDate,
  endDate,
  preselectedDate,
  preselectedMealType,
}) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState("");
  const [mealDate, setMealDate] = useState("");
  const [mealType, setMealType] = useState("");
  const [servings, setServings] = useState("1");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchRecipes();
      // Set date and meal type based on props
      setMealDate(preselectedDate || startDate);
      setMealType(preselectedMealType || "");
    }
  }, [isOpen, startDate, preselectedDate, preselectedMealType]);

  useEffect(() => {
    const filtered = recipes.filter(recipe =>
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecipes(filtered);
  }, [recipes, searchTerm]);

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from("recipes")
        .select("id, title, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
      setFilteredRecipes(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load recipes: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipe || !mealDate || !mealType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("meal_plan_items")
        .insert([{
          meal_plan_id: mealPlanId,
          recipe_id: selectedRecipe,
          meal_date: mealDate,
          meal_type: mealType,
          servings: parseInt(servings)
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Recipe added to meal plan!",
      });

      // Reset form
      setSelectedRecipe("");
      setMealDate(preselectedDate || startDate);
      setMealType(preselectedMealType || "");
      setServings("1");
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add recipe: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Recipe to Meal Plan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="search">Search Recipes</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search your recipes..."
                className="pl-10"
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto border rounded-md p-2">
            {filteredRecipes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recipes found</p>
            ) : (
              <div className="space-y-2">
                {filteredRecipes.map((recipe) => (
                  <Card
                    key={recipe.id}
                    className={`cursor-pointer transition-colors ${
                      selectedRecipe === recipe.id ? 'bg-emerald-100 border-emerald-300' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedRecipe(recipe.id)}
                  >
                    <CardContent className="p-3">
                      <h4 className="font-medium">{recipe.title}</h4>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="meal_date">Date</Label>
              <Input
                id="meal_date"
                type="date"
                value={mealDate}
                onChange={(e) => setMealDate(e.target.value)}
                min={startDate}
                max={endDate}
                required
              />
            </div>
            <div>
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                min="1"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="meal_type">Meal Type</Label>
            <Select value={mealType} onValueChange={setMealType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-emerald-500 hover:bg-emerald-600"
              disabled={loading || !selectedRecipe}
            >
              {loading ? "Adding..." : "Add Recipe"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRecipeToMealPlanModal;
