
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, CheckSquare, Square } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ShoppingList {
  id: string;
  title: string;
  created_at: string;
  meal_plan_id: string | null;
}

interface ShoppingListItem {
  id: string;
  ingredient: string;
  checked: boolean;
}

interface ShoppingListCardProps {
  shoppingList: ShoppingList;
  onRefresh: () => void;
}

const ShoppingListCard: React.FC<ShoppingListCardProps> = ({ shoppingList, onRefresh }) => {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
  }, [shoppingList.id]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("shopping_list_items")
        .select("id, ingredient, checked")
        .eq("shopping_list_id", shoppingList.id)
        .limit(3);

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error("Failed to fetch shopping list items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this shopping list?")) return;

    try {
      const { error } = await supabase
        .from("shopping_lists")
        .delete()
        .eq("id", shoppingList.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Shopping list deleted successfully",
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete shopping list: " + error.message,
        variant: "destructive",
      });
    }
  };

  const checkedCount = items.filter(item => item.checked).length;
  const totalCount = items.length;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-emerald-800">{shoppingList.title}</CardTitle>
        <p className="text-sm text-emerald-600">
          Created {format(new Date(shoppingList.created_at), "MMM d, yyyy")}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-gray-500">Loading items...</p>
        ) : (
          <>
            <div className="text-sm text-emerald-600">
              {totalCount > 0 ? (
                <p>{checkedCount} of {totalCount} items completed</p>
              ) : (
                <p>No items yet</p>
              )}
            </div>
            {items.length > 0 && (
              <div className="space-y-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    {item.checked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={item.checked ? "line-through text-gray-500" : ""}>
                      {item.ingredient}
                    </span>
                  </div>
                ))}
                {totalCount > 3 && (
                  <p className="text-xs text-gray-500">+{totalCount - 3} more items</p>
                )}
              </div>
            )}
          </>
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/shopping-list/${shoppingList.id}`)}
            className="flex-1 flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShoppingListCard;
