
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useRecipeUserStatus(session?: any) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    
    const userLoggedIn = !!(session && session.user);
    setIsLoggedIn(userLoggedIn);
    
    console.log("useRecipeUserStatus - Debug:", {
      sessionExists: !!session,
      userExists: !!session?.user,
      userId: session?.user?.id,
      userLoggedIn
    });
    
    async function fetchIsPaid() {
      if (session?.user?.id) {
        try {
          console.log("Fetching paid status for user:", session.user.id);
          
          const { data, error } = await supabase
            .from("profiles")
            .select("is_paid")
            .eq("id", session.user.id)
            .single();
          
          console.log("Profiles query result:", { data, error });
          
          if (!cancelled && !error) {
            console.log("User paid status:", data?.is_paid);
            setIsPaid(Boolean(data?.is_paid));
          } else if (error) {
            console.error("Error fetching paid status:", error);
            setIsPaid(false);
          }
        } catch (err) {
          console.error("Exception fetching paid status:", err);
          if (!cancelled) {
            setIsPaid(false);
          }
        }
      } else {
        console.log("No user ID found, setting isPaid to false");
        setIsPaid(false);
      }
      
      if (!cancelled) {
        setLoading(false);
      }
    }
    
    fetchIsPaid();
    return () => { cancelled = true; };
  }, [session?.user?.id, session?.user]);

  console.log("useRecipeUserStatus - Final state:", { isLoggedIn, isPaid, loading });

  return { isLoggedIn, isPaid, loading };
}
