
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ShoppingCart, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface ShoppingList {
  id: string;
  title: string;
  created_at: string;
  meal_plan_id: string | null;
}

interface ShoppingListItem {
  id: string;
  ingredient: string;
  quantity: string | null;
  unit: string | null;
  checked: boolean;
  recipe_id: string | null;
}

interface ShoppingListViewProps {
  session?: Session | null;
}

const ShoppingListView: React.FC<ShoppingListViewProps> = ({ session }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    if (!session?.user) {
      navigate("/auth");
      return;
    }
    if (!id) {
      navigate("/shopping-lists");
      return;
    }
    fetchShoppingListData();
  }, [session, navigate, id]);

  const fetchShoppingListData = async () => {
    try {
      // Fetch shopping list details
      const { data: listData, error: listError } = await supabase
        .from("shopping_lists")
        .select("*")
        .eq("id", id)
        .single();

      if (listError) throw listError;
      setShoppingList(listData);

      // Fetch shopping list items
      const { data: itemsData, error: itemsError } = await supabase
        .from("shopping_list_items")
        .select("*")
        .eq("shopping_list_id", id)
        .order("created_at", { ascending: true });

      if (itemsError) throw itemsError;
      setItems(itemsData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load shopping list: " + error.message,
        variant: "destructive",
      });
      navigate("/shopping-lists");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = async (itemId: string, checked: boolean) => {
    try {
      const { error } = await supabase
        .from("shopping_list_items")
        .update({ checked })
        .eq("id", itemId);

      if (error) throw error;

      setItems(items.map(item => 
        item.id === itemId ? { ...item, checked } : item
      ));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update item: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddItem = async () => {
    if (!newItem.trim()) return;

    try {
      const { data, error } = await supabase
        .from("shopping_list_items")
        .insert([{
          shopping_list_id: id!,
          ingredient: newItem.trim(),
        }])
        .select()
        .single();

      if (error) throw error;

      setItems([...items, data]);
      setNewItem("");
      toast({
        title: "Success",
        description: "Item added to shopping list",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add item: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("shopping_list_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      setItems(items.filter(item => item.id !== itemId));
      toast({
        title: "Success",
        description: "Item removed from shopping list",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete item: " + error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50">
        <Navbar loggedIn={!!session} userEmail={session?.user?.email} session={session} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="text-emerald-600 mt-2">Loading shopping list...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!shoppingList) {
    return null;
  }

  const checkedCount = items.filter(item => item.checked).length;
  const totalCount = items.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50">
      <Navbar loggedIn={!!session} userEmail={session?.user?.email} session={session} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/shopping-lists")}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shopping Lists
          </Button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-emerald-800 mb-2 flex items-center gap-2">
                <ShoppingCart className="w-8 h-8" />
                {shoppingList.title}
              </h1>
              <p className="text-emerald-600">
                {totalCount > 0 ? `${checkedCount} of ${totalCount} items completed` : "No items yet"}
              </p>
            </div>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter ingredient or item..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddItem()}
                className="flex-1"
              />
              <Button
                onClick={handleAddItem}
                className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shopping List Items</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-emerald-800 mb-2">
                  No items in your list yet
                </h3>
                <p className="text-emerald-600">
                  Add some items to get started with your shopping!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={(checked) => 
                        handleToggleItem(item.id, checked as boolean)
                      }
                    />
                    <div className="flex-1">
                      <span
                        className={`${
                          item.checked
                            ? "line-through text-gray-500"
                            : "text-emerald-800"
                        }`}
                      >
                        {item.ingredient}
                        {item.quantity && ` (${item.quantity}${item.unit ? ` ${item.unit}` : ""})`}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ShoppingListView;
