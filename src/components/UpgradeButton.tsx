
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UpgradeButtonProps {
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  className?: string;
  showText?: boolean;
}

const UpgradeButton: React.FC<UpgradeButtonProps> = ({ 
  size = "default", 
  variant = "default",
  className = "",
  showText = true 
}) => {
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      console.log("Starting checkout process...");
      
      // Get current session (may be null for guests)
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Include auth header if user is logged in
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers,
      });

      if (error) {
        console.error("Checkout error:", error);
        toast.error("Failed to start checkout process. Please try again.");
        return;
      }

      if (data?.url) {
        console.log("Redirecting to checkout:", data.url);
        window.open(data.url, '_blank');
      } else {
        toast.error("No checkout URL received. Please try again.");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <Button
      onClick={handleUpgrade}
      disabled={isUpgrading}
      size={size}
      variant={variant}
      className={`bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold ${className}`}
    >
      {isUpgrading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {showText && "Processing..."}
        </>
      ) : (
        <>
          <Crown className="w-4 h-4 mr-2" />
          {showText && "Upgrade to Premium"}
        </>
      )}
    </Button>
  );
};

export default UpgradeButton;
