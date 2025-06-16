import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Plus, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRecipeUserStatus } from "@/hooks/useRecipeUserStatus";
import ShoppingListCard from "@/components/shopping/ShoppingListCard";
import CreateShoppingListModal from "@/components/shopping/CreateShoppingListModal";
import PremiumFeatureGate from "@/components/PremiumFeatureGate";

interface ShoppingList {
  id: string;
  title: string;
  created_at: string;
  meal_plan_id: string | null;
}

interface ShoppingListsProps {
  session?: Session | null;
}

const ShoppingLists: React.FC<ShoppingListsProps> = ({ session }) => {
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isPaid, loading: statusLoading } = useRecipeUserStatus(session);

  // Debug logging
  console.log("ShoppingLists - Debug info:", {
    statusLoading,
    isPaid,
    sessionExists: !!session,
    userId: session?.user?.id
  });

  useEffect(() => {
    if (!session?.user) {
      navigate("/auth");
      return;
    }
    fetchShoppingLists();
  }, [session, navigate]);

  const fetchShoppingLists = async () => {
    try {
      const { data, error } = await supabase
        .from("shopping_lists")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setShoppingLists(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load shopping lists: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShoppingList = async (title: string) => {
    try {
      const { data, error } = await supabase
        .from("shopping_lists")
        .insert([{
          user_id: session!.user.id,
          title
        }])
        .select()
        .single();

      if (error) throw error;

      setShoppingLists([data, ...shoppingLists]);
      setShowCreateModal(false);
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

  if (!session?.user) {
    return null;
  }

  // Show loading state while checking user status
  if (statusLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50">
        <Navbar loggedIn={!!session} userEmail={session?.user?.email} session={session} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="text-emerald-600 mt-2">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // FIXED: Use session directly - if user has session but is not paid, show premium gate
  if (session?.user && !isPaid) {
    console.log("ShoppingLists - User has session but not paid, showing premium gate", { isPaid, statusLoading, userId: session.user.id });
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50">
        <Navbar loggedIn={!!session} userEmail={session?.user?.email} session={session} />
        <PremiumFeatureGate 
          featureName="Shopping Lists"
          description="Create and manage your shopping lists, automatically generate them from your meal plans, and organize your grocery shopping efficiently."
        />
      </div>
    );
  }

  // Main content for paid users
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50">
      <Navbar loggedIn={!!session} userEmail={session?.user?.email} session={session} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-800 mb-2 flex items-center gap-2">
            <ShoppingCart className="w-8 h-8" />
            Shopping Lists
          </h1>
          <p className="text-emerald-600">
            Create and manage your shopping lists
          </p>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-emerald-800">
            Your Lists ({shoppingLists.length})
          </h2>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create List
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="text-emerald-600 mt-2">Loading shopping lists...</p>
          </div>
        ) : shoppingLists.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <List className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-emerald-800 mb-2">
                No shopping lists yet
              </h3>
              <p className="text-emerald-600 mb-4">
                Create your first shopping list to get organized!
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Create Your First List
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shoppingLists.map((list) => (
              <ShoppingListCard 
                key={list.id} 
                shoppingList={list}
                onRefresh={fetchShoppingLists}
              />
            ))}
          </div>
        )}

        <CreateShoppingListModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateShoppingList}
        />
      </main>
    </div>
  );
};

export default ShoppingLists;
