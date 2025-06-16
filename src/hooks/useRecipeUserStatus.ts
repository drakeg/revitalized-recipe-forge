
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useRecipeUserStatus(session?: any) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setIsLoggedIn(!!(session && session.user));
    
    async function fetchIsPaid() {
      if (session?.user?.id) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("is_paid")
            .eq("id", session.user.id)
            .single();
          
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
        setIsPaid(false);
      }
      
      if (!cancelled) {
        setLoading(false);
      }
    }
    
    fetchIsPaid();
    return () => { cancelled = true; };
  }, [session?.user?.id, session?.user]); // Also depend on session.user to catch updates

  return { isLoggedIn, isPaid, loading };
}
