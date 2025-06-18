
import { useState, useEffect } from "react";
import { useSubscriptionStatus } from "./useSubscriptionStatus";

export function useRecipeUserStatus(session?: any) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentSession, setCurrentSession] = useState(session);
  
  // Use the new subscription status hook
  const { subscribed: isPaid, loading, refreshSubscription } = useSubscriptionStatus(session);
  
  // Update internal session if the prop changes
  useEffect(() => {
    if (session !== currentSession) {
      setCurrentSession(session);
    }
  }, [session]);

  useEffect(() => {
    // DEBUG: Enhanced logging
    console.log("useRecipeUserStatus - SESSION RECEIVED:", {
      sessionExists: !!session,
      userExists: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      timestamp: new Date().toISOString(),
    });
    
    // Check if user is logged in
    const userLoggedIn = !!(session?.user?.id);
    console.log("useRecipeUserStatus - User logged in:", userLoggedIn);
    console.log("useRecipeUserStatus - Session user ID:", session?.user?.id);
    
    setIsLoggedIn(userLoggedIn);
  }, [session?.user?.id, session]);

  console.log("useRecipeUserStatus - Final state:", { isLoggedIn, isPaid, loading });
  
  return { 
    isLoggedIn, 
    isPaid, 
    loading, 
    session: currentSession,
    refreshSubscription
  };
}
