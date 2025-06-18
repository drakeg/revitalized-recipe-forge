
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Crown, Settings, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubscriptionManagerProps {
  isPaid: boolean;
  onRefreshStatus: () => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ 
  isPaid, 
  onRefreshStatus 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      console.log("Opening customer portal...");
      
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        console.error("Customer portal error:", error);
        toast.error("Failed to open subscription management. Please try again.");
        return;
      }

      if (data?.url) {
        console.log("Redirecting to customer portal:", data.url);
        // Open customer portal in a new tab
        window.open(data.url, '_blank');
      } else {
        toast.error("No portal URL received. Please try again.");
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshStatus = () => {
    onRefreshStatus();
    toast.success("Subscription status refreshed!");
  };

  if (!isPaid) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1 border-yellow-400 text-yellow-700 hover:bg-yellow-50"
        onClick={handleRefreshStatus}
      >
        <Crown size={16} />
        Refresh Status
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-1 border-emerald-400 text-emerald-900 hover:bg-emerald-100"
      onClick={handleManageSubscription}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Settings size={16} />
      )}
      Manage Subscription
    </Button>
  );
};

export default SubscriptionManager;
