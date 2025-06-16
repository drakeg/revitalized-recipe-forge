
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
    
    console.log("=== useRecipeUserStatus - Comprehensive Debug ===");
    console.log("Session object:", session);
    console.log("User object:", session?.user);
    console.log("User ID:", session?.user?.id);
    console.log("User email:", session?.user?.email);
    console.log("User logged in:", userLoggedIn);
    
    // Set logged in status immediately
    setIsLoggedIn(userLoggedIn);
    
    async function fetchIsPaid() {
      if (!userLoggedIn || !session?.user?.id) {
        console.log("❌ No user ID found or not logged in, setting isPaid to false");
        if (!cancelled) {
          setIsPaid(false);
          setLoading(false);
        }
        return;
      }

      try {
        console.log("🔍 Fetching paid status for user:", session.user.id);
        
        // First, let's check if the user exists in profiles table
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id);
        
        console.log("📊 Full profiles query result:", { 
          data: profileData, 
          error: profileError,
          userExists: profileData && profileData.length > 0 
        });
        
        if (profileError) {
          console.error("❌ Error fetching profile:", profileError);
          if (!cancelled) {
            setIsPaid(false);
            setLoading(false);
          }
          return;
        }

        if (!profileData || profileData.length === 0) {
          console.log("⚠️ User profile not found, creating one...");
          // Create profile if it doesn't exist
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert([{ id: session.user.id, is_paid: true }])
            .select()
            .single();
          
          console.log("✨ Profile creation result:", { data: newProfile, error: createError });
          
          if (!cancelled) {
            if (!createError && newProfile) {
              setIsPaid(Boolean(newProfile.is_paid));
            } else {
              setIsPaid(false);
            }
            setLoading(false);
          }
          return;
        }

        const profile = profileData[0];
        console.log("👤 User profile found:", profile);
        console.log("💳 Paid status:", profile.is_paid);
        
        if (!cancelled) {
          setIsPaid(Boolean(profile.is_paid));
          setLoading(false);
        }
      } catch (err) {
        console.error("💥 Exception fetching paid status:", err);
        if (!cancelled) {
          setIsPaid(false);
          setLoading(false);
        }
      }
    }
    
    fetchIsPaid();
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  console.log("=== useRecipeUserStatus - Final State ===");
  console.log("isLoggedIn:", isLoggedIn);
  console.log("isPaid:", isPaid);
  console.log("loading:", loading);

  return { isLoggedIn, isPaid, loading };
}
