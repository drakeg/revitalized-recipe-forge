
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";
import { Plus } from "lucide-react";

interface Recipe {
  id: string;
  title: string;
  analysis: string | null;
}

interface ShoppingList {
  id: string;
  title: string;
}

interface ParsedIngredient {
  original: string;
  quantity: string | null;
  unit: string | null;
  ingredient: string;
}

interface AddToShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe | null;
  session: Session | null;
}

// Helper function to parse ingredient strings into quantity, unit, and ingredient
const parseIngredient = (ingredientText: string): ParsedIngredient => {
  // Remove common bullet points and clean the text
  const cleaned = ingredientText.replace(/^[-•*\d.)\s]+/, '').trim();
  
  // Regular expression to match quantity, unit, and ingredient
  // Matches patterns like: "2 cups flour", "1/2 tsp salt", "3 large eggs", "200g butter"
  const match = cleaned.match(/^(\d+(?:\/\d+)?(?:\.\d+)?)\s*([a-zA-Z]*)\s+(.+)$/);
  
  if (match) {
    const [, quantity, unit, ingredient] = match;
    return {
      original: ingredientText,
      quantity: quantity.trim(),
      unit: unit.trim() || null,
      ingredient: ingredient.trim()
    };
  }
  
  // Try to match just quantity and ingredient (no unit)
  const quantityMatch = cleaned.match(/^(\d+(?:\/\d+)?(?:\.\d+)?)\s+(.+)$/);
  if (quantityMatch) {
    const [, quantity, ingredient] = quantityMatch;
    return {
      original: ingredientText,
      quantity: quantity.trim(),
      unit: null,
      ingredient: ingredient.trim()
    };
  }
  
  // If no quantity found, return the whole thing as ingredient
  return {
    original: ingredientText,
    quantity: null,
    unit: null,
    ingredient: cleaned
  };
};

const AddToShoppingListModal: React.FC<AddToShoppingListModalProps> = ({
  isOpen,
  onClose,
  recipe,
  session,
}) => {
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [selectedList, setSelectedList] = useState("");
  const [ingredients, setIngredients] = useState<ParsedIngredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [newListName, setNewListName] = useState("");
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && session) {
      fetchShoppingLists();
      if (recipe) {
        extractIngredients();
      }
    }
  }, [isOpen, session, recipe]);

  const fetchShoppingLists = async () => {
    try {
      const { data, error } = await supabase
        .from("shopping_lists")
        .select("id, title")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setShoppingLists(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load shopping lists: " + error.message,
        variant: "destructive",
      });
    }
  };

  const extractIngredients = () => {
    if (!recipe?.analysis) return;

    const lines = recipe.analysis.split('\n');
    const ingredientSection = lines.findIndex(line => 
      line.toLowerCase().includes('ingredients') || 
      line.toLowerCase().includes('ingredient')
    );
    
    if (ingredientSection !== -1) {
      const extractedIngredients: ParsedIngredient[] = [];
      for (let i = ingredientSection + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        if (line.toLowerCase().includes('instructions') || 
            line.toLowerCase().includes('direction')) break;
        
        const parsedIngredient = parseIngredient(line);
        if (parsedIngredient.ingredient && parsedIngredient.ingredient.length > 2) {
          extractedIngredients.push(parsedIngredient);
        }
      }
      setIngredients(extractedIngredients);
      setSelectedIngredients(new Set(extractedIngredients.map(ing => ing.original))); // Select all by default
    }
  };

  const handleCreateNewList = async () => {
    if (!newListName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a list name",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("shopping_lists")
        .insert([{
          user_id: session!.user.id,
          title: newListName.trim()
        }])
        .select()
        .single();

      if (error) throw error;

      setShoppingLists(prev => [data, ...prev]);
      setSelectedList(data.id);
      setNewListName("");
      setShowCreateNew(false);
      
      toast({
        title: "Success",
        description: "Shopping list created successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create shopping list: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!selectedList) {
      toast({
        title: "Error",
        description: "Please select a shopping list",
        variant: "destructive",
      });
      return;
    }

    if (selectedIngredients.size === 0) {
      toast({
        title: "Error",
        description: "Please select at least one ingredient",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const selectedParsedIngredients = ingredients.filter(ing => 
        selectedIngredients.has(ing.original)
      );

      const ingredientItems = selectedParsedIngredients.map(parsed => ({
        shopping_list_id: selectedList,
        ingredient: parsed.ingredient,
        quantity: parsed.quantity,
        unit: parsed.unit,
        recipe_id: recipe!.id
      }));

      const { error } = await supabase
        .from("shopping_list_items")
        .insert(ingredientItems);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Added ${selectedIngredients.size} ingredients to shopping list!`,
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add ingredients: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleIngredient = (original: string) => {
    const newSelected = new Set(selectedIngredients);
    if (newSelected.has(original)) {
      newSelected.delete(original);
    } else {
      newSelected.add(original);
    }
    setSelectedIngredients(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIngredients.size === ingredients.length) {
      setSelectedIngredients(new Set());
    } else {
      setSelectedIngredients(new Set(ingredients.map(ing => ing.original)));
    }
  };

  const formatIngredientDisplay = (parsed: ParsedIngredient) => {
    let display = parsed.ingredient;
    if (parsed.quantity) {
      display = `${parsed.quantity}${parsed.unit ? ` ${parsed.unit}` : ''} ${parsed.ingredient}`;
    }
    return display;
  };

  if (!recipe) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add to Shopping List</DialogTitle>
          <p className="text-sm text-gray-600">From: {recipe.title}</p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Shopping List</Label>
            {!showCreateNew ? (
              <div className="flex gap-2">
                <Select value={selectedList} onValueChange={setSelectedList}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a shopping list" />
                  </SelectTrigger>
                  <SelectContent>
                    {shoppingLists.map((list) => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateNew(true)}
                  className="px-3"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="New list name"
                  className="flex-1"
                />
                <Button onClick={handleCreateNewList} variant="outline">
                  Create
                </Button>
                <Button 
                  onClick={() => setShowCreateNew(false)} 
                  variant="ghost"
                  className="px-3"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {ingredients.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Ingredients ({selectedIngredients.size}/{ingredients.length} selected)</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSelectAll}
                >
                  {selectedIngredients.size === ingredients.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <Card>
                <CardContent className="p-3 max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {ingredients.map((parsed, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedIngredients.has(parsed.original)}
                          onCheckedChange={() => toggleIngredient(parsed.original)}
                        />
                        <span className="text-sm flex-1">
                          {formatIngredientDisplay(parsed)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1 bg-emerald-500 hover:bg-emerald-600"
              disabled={loading || !selectedList || selectedIngredients.size === 0}
            >
              {loading ? "Adding..." : "Add to List"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToShoppingListModal;
