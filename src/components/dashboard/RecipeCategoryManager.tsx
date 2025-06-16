
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface RecipeCategoryManagerProps {
  recipeId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const RecipeCategoryManager: React.FC<RecipeCategoryManagerProps> = ({
  recipeId,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [assignedCategories, setAssignedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, recipeId]);

  const fetchData = async () => {
    try {
      // Fetch all categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("recipe_categories")
        .select("*")
        .order("name");

      if (categoriesError) throw categoriesError;

      // Fetch assigned categories for this recipe
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("recipe_category_assignments")
        .select("category_id")
        .eq("recipe_id", recipeId);

      if (assignmentsError) throw assignmentsError;

      setCategories(categoriesData || []);
      setAssignedCategories(assignmentsData?.map(a => a.category_id) || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load categories: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCategory = async (categoryId: string) => {
    const isAssigned = assignedCategories.includes(categoryId);

    try {
      if (isAssigned) {
        // Remove assignment
        const { error } = await supabase
          .from("recipe_category_assignments")
          .delete()
          .eq("recipe_id", recipeId)
          .eq("category_id", categoryId);

        if (error) throw error;

        setAssignedCategories(prev => prev.filter(id => id !== categoryId));
      } else {
        // Add assignment
        const { error } = await supabase
          .from("recipe_category_assignments")
          .insert([{ recipe_id: recipeId, category_id: categoryId }]);

        if (error) throw error;

        setAssignedCategories(prev => [...prev, categoryId]);
      }

      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update category: " + error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Recipe Categories</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-emerald-800 mb-3">Available Categories</h4>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => {
                  const isAssigned = assignedCategories.includes(category.id);
                  return (
                    <Button
                      key={category.id}
                      variant={isAssigned ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleCategory(category.id)}
                      className={`justify-between ${
                        isAssigned 
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                          : "hover:bg-emerald-50"
                      }`}
                    >
                      <span>{category.name}</span>
                      {isAssigned ? (
                        <X className="w-3 h-3" />
                      ) : (
                        <Plus className="w-3 h-3" />
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>

            {assignedCategories.length > 0 && (
              <div>
                <h4 className="font-medium text-emerald-800 mb-2">Assigned Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {assignedCategories.map((categoryId) => {
                    const category = categories.find(c => c.id === categoryId);
                    return category ? (
                      <Badge 
                        key={categoryId} 
                        variant="secondary"
                        style={{ backgroundColor: category.color + '20', color: category.color }}
                      >
                        {category.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button onClick={onClose} className="bg-emerald-500 hover:bg-emerald-600">
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RecipeCategoryManager;
