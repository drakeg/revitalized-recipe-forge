
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useRecipeUserStatus(session?: any) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    
    // Check if user is logged in
    const userLoggedIn = !!(session?.user?.id);
    setIsLoggedIn(userLoggedIn);
    
    async function fetchIsPaid() {
      if (!userLoggedIn || !session?.user?.id) {
        if (!cancelled) {
          setIsPaid(false);
          setLoading(false);
        }
        return;
      }

      try {
        // Fetch user's paid status from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("is_paid")
          .eq("id", session.user.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          if (!cancelled) {
            setIsPaid(false);
            setLoading(false);
          }
          return;
        }

        if (!cancelled) {
          setIsPaid(Boolean(profileData?.is_paid));
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

  return { isLoggedIn, isPaid, loading };
}
