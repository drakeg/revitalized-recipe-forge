
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import MealPlanning from "./pages/MealPlanning";
import MealPlanView from "./pages/MealPlanView";
import ShoppingLists from "./pages/ShoppingLists";
import ShoppingListView from "./pages/ShoppingListView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index session={session} />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard session={session} />} />
            <Route path="/meal-planning" element={<MealPlanning session={session} />} />
            <Route path="/meal-plan/:id" element={<MealPlanView session={session} />} />
            <Route path="/shopping-lists" element={<ShoppingLists session={session} />} />
            <Route path="/shopping-list/:id" element={<ShoppingListView session={session} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
