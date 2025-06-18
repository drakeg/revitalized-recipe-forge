
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart } from "lucide-react";
import CreateShoppingListModal from "@/components/shopping/CreateShoppingListModal";
import ShoppingListCard from "@/components/shopping/ShoppingListCard";
import SubscriptionManager from "@/components/SubscriptionManager";

interface ShoppingList {
  id: string;
  title: string;
  created_at: string;
  meal_plan_id: string | null;
}

interface ShoppingListsProps {
  session: Session | null;
}

const ShoppingLists: React.FC<ShoppingListsProps> = ({ session }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscribed: isPaid, loading: subscriptionLoading, refreshSubscription } = useSubscriptionStatus(session);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate("/auth");
      return;
    }

    if (!subscriptionLoading && !isPaid) {
      // Show upgrade prompt but don't redirect immediately
      return;
    }

    if (isPaid) {
      fetchShoppingLists();
    }
  }, [session, isPaid, subscriptionLoading, navigate]);

  const fetchShoppingLists = async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from("shopping_lists")
        .select("*")
        .eq("user_id", session.user.id)
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
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from("shopping_lists")
        .insert([
          {
            title,
            user_id: session.user.id,
          },
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Shopping list created successfully!",
      });

      setShowCreateModal(false);
      fetchShoppingLists();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create shopping list: " + error.message,
        variant: "destructive",
      });
    }
  };

  if (!session) {
    return null; // Will redirect to auth
  }

  if (subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-100">
        <Navbar loggedIn={true} userEmail={session.user?.email} session={session} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="text-emerald-600 mt-2">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isPaid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-100">
        <Navbar loggedIn={true} userEmail={session.user?.email} session={session} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-emerald-800 mb-4 flex items-center justify-center gap-2">
              <ShoppingCart className="w-8 h-8" />
              Shopping Lists
            </h1>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Premium Feature Required</h2>
              <p className="text-gray-600 mb-6">
                Shopping lists are available exclusively to premium subscribers. Upgrade your account to access this feature and unlock:
              </p>
              <ul className="text-left text-gray-700 mb-8 space-y-2">
                <li>✅ Create unlimited shopping lists</li>
                <li>✅ Generate lists from meal plans</li>
                <li>✅ Add recipes directly to lists</li>
                <li>✅ Smart ingredient organization</li>
                <li>✅ Check off items as you shop</li>
              </ul>
              <SubscriptionManager 
                session={session} 
                onSubscriptionChange={refreshSubscription}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-100">
      <Navbar loggedIn={true} userEmail={session.user?.email} session={session} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-800 mb-2 flex items-center gap-2">
            <ShoppingCart className="w-8 h-8" />
            Shopping Lists
          </h1>
          <p className="text-emerald-600">
            Manage your shopping lists and add ingredients from your recipes
          </p>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-emerald-800">
            Your Shopping Lists ({shoppingLists.length})
          </h2>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Shopping List
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="text-emerald-600 mt-2">Loading shopping lists...</p>
          </div>
        ) : shoppingLists.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-emerald-800 mb-2">
              No shopping lists yet
            </h3>
            <p className="text-emerald-600 mb-4">
              Create your first shopping list to get started!
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Create Your First Shopping List
            </Button>
          </div>
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
      </div>
    </div>
  );
};

export default ShoppingLists;
