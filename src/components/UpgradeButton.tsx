
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
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          'Content-Type': 'application/json',
        },
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
