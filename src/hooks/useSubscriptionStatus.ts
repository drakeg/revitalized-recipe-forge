
import { useState, useEffect, useCallback } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier?: string | null;
  subscription_end?: string | null;
}

export const useSubscriptionStatus = (session: Session | null) => {
  const [status, setStatus] = useState<SubscriptionStatus>({ subscribed: false });
  const [loading, setLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    if (!session?.user) {
      setStatus({ subscribed: false });
      setLoading(false);
      return;
    }

    try {
      console.log("Checking subscription status...");
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        console.error("Error checking subscription:", error);
        setStatus({ subscribed: false });
      } else {
        console.log("Subscription status:", data);
        setStatus(data || { subscribed: false });
      }
    } catch (error) {
      console.error("Exception checking subscription:", error);
      setStatus({ subscribed: false });
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  const refreshSubscription = useCallback(async () => {
    setLoading(true);
    await checkSubscription();
  }, [checkSubscription]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Check for subscription success in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('subscription') === 'success') {
      toast.success("Subscription activated! Welcome to Premium!");
      // Remove the parameter from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      // Refresh subscription status
      setTimeout(() => {
        refreshSubscription();
      }, 2000);
    } else if (urlParams.get('subscription') === 'cancelled') {
      toast.error("Subscription cancelled. You can try again anytime.");
      // Remove the parameter from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [refreshSubscription]);

  return {
    ...status,
    loading,
    refreshSubscription,
  };
};
