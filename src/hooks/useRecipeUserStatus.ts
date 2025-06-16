
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useRecipeUserStatus(session?: any) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    
    // Check if user is logged in - more robust check
    const userLoggedIn = !!(session?.user?.id);
    
    console.log("useRecipeUserStatus - Debug:", {
      sessionExists: !!session,
      userExists: !!session?.user,
      userId: session?.user?.id,
      userLoggedIn
    });
    
    // Set logged in status immediately
    setIsLoggedIn(userLoggedIn);
    
    async function fetchIsPaid() {
      if (!userLoggedIn || !session?.user?.id) {
        console.log("No user ID found or not logged in, setting isPaid to false");
        if (!cancelled) {
          setIsPaid(false);
          setLoading(false);
        }
        return;
      }

      try {
        console.log("Fetching paid status for user:", session.user.id);
        
        const { data, error } = await supabase
          .from("profiles")
          .select("is_paid")
          .eq("id", session.user.id)
          .single();
        
        console.log("Profiles query result:", { data, error });
        
        if (!cancelled) {
          if (!error && data) {
            console.log("User paid status:", data.is_paid);
            setIsPaid(Boolean(data.is_paid));
          } else {
            console.error("Error fetching paid status:", error);
            setIsPaid(false);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Exception fetching paid status:", err);
        if (!cancelled) {
          setIsPaid(false);
          setLoading(false);
        }
      }
    }
    
    fetchIsPaid();
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  console.log("useRecipeUserStatus - Final state:", { isLoggedIn, isPaid, loading });

  return { isLoggedIn, isPaid, loading };
}
