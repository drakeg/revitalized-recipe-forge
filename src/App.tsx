
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/Auth";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

// Higher-order component for route protection
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [checked, setChecked] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setChecked(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecked(true);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!checked) {
    return null;
  }

  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = React.useState<Session | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    // Set up the auth state listener first for proper session persistence
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      
      // Update state synchronously
      setSession(session);
      setUser(session?.user ?? null);
      setReady(true);
      
      // Defer any additional data fetching to prevent deadlocks
      if (event === 'SIGNED_IN' && session?.user) {
        setTimeout(() => {
          // Any additional user data fetching can go here
          console.log('User signed in successfully');
        }, 0);
      }
      
      if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      }
    });
    
    // Get initial session AFTER setting up the listener
    supabase.auth.getSession().then(({ data }) => {
      console.log('Initial session:', data.session?.user?.email);
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Don't render until session is loaded
  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <Index
                  session={session}
                  user={user}
                />
              }
            />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <Dashboard session={session} />
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
