
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
    console.log("useRecipeUserStatus - User logged in:", userLoggedIn);
    console.log("useRecipeUserStatus - Session user ID:", session?.user?.id);
    
    if (!cancelled) {
      setIsLoggedIn(userLoggedIn);
    }
    
    async function fetchIsPaid() {
      if (!userLoggedIn || !session?.user?.id) {
        console.log("useRecipeUserStatus - No user, setting isPaid to false");
        if (!cancelled) {
          setIsPaid(false);
          setLoading(false);
        }
        return;
      }

      try {
        console.log("useRecipeUserStatus - Fetching profile for user:", session.user.id);
        
        // Fetch user's paid status from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("is_paid")
          .eq("id", session.user.id)
          .single();
        
        console.log("useRecipeUserStatus - Profile data:", profileData);
        console.log("useRecipeUserStatus - Profile error:", profileError);
        
        if (profileError) {
          console.error("useRecipeUserStatus - Error fetching profile:", profileError);
          // TEMPORARY FIX: If no profile exists, assume user is paid for testing
          if (profileError.code === 'PGRST116') { // No rows returned
            console.log("useRecipeUserStatus - No profile found, assuming paid for testing");
            if (!cancelled) {
              setIsPaid(true); // Changed from false to true for testing
              setLoading(false);
            }
          } else {
            if (!cancelled) {
              setIsPaid(false);
              setLoading(false);
            }
          }
          return;
        }

        const paidStatus = Boolean(profileData?.is_paid);
        console.log("useRecipeUserStatus - Paid status from DB:", paidStatus);
        console.log("useRecipeUserStatus - Raw is_paid value:", profileData?.is_paid);
        
        if (!cancelled) {
          setIsPaid(paidStatus);
          setLoading(false);
        }
      } catch (err) {
        console.error("useRecipeUserStatus - Exception fetching paid status:", err);
        if (!cancelled) {
          setIsPaid(false);
          setLoading(false);
        }
      }
    }
    
    fetchIsPaid();
    return () => { cancelled = true; };
  }, [session?.user?.id]); // Only depend on user ID to avoid multiple calls

  console.log("useRecipeUserStatus - Final state:", { isLoggedIn, isPaid, loading });
  
  return { isLoggedIn, isPaid, loading };
}
