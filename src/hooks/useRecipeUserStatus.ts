
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useRecipeUserStatus(session?: any) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoggedIn(!!(session && session.user));
    async function fetchIsPaid() {
      if (session?.user?.id) {
        const { data } = await supabase
          .from("profiles")
          .select("is_paid")
          .eq("id", session.user.id)
          .single();
        if (!cancelled) setIsPaid(Boolean(data?.is_paid));
      } else {
        setIsPaid(false);
      }
    }
    fetchIsPaid();
    return () => { cancelled = true; };
    // Only refetch if session.user.id changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  return { isLoggedIn, isPaid };
}
