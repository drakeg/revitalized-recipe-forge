
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, X, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PremiumFeatureGateProps {
  featureName: string;
  description: string;
  children?: React.ReactNode;
  isModal?: boolean;
  onClose?: () => void;
}

const PremiumFeatureGate: React.FC<PremiumFeatureGateProps> = ({
  featureName,
  description,
  children,
  isModal = false,
  onClose
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

  const content = (
    <Card className="max-w-2xl mx-auto text-center border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg">
      {isModal && onClose && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
      
      <CardHeader>
        <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <Crown className="w-8 h-8 text-yellow-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-emerald-800 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-500" />
          Unlock {featureName}
          <Sparkles className="w-6 h-6 text-yellow-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-emerald-600 text-lg">
          {description}
        </p>
        
        <div className="bg-white/70 rounded-lg p-6 border border-yellow-200">
          <h3 className="font-semibold text-emerald-800 mb-4">Get Premium Access For Just:</h3>
          <div className="text-4xl font-bold text-emerald-800 mb-2">$9.99<span className="text-xl font-normal">/month</span></div>
          <div className="text-emerald-600 text-sm mb-4">One simple price • All premium features included</div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-700">Advanced meal planning</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-700">Smart shopping lists</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-700">Recipe organization</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-700">Priority support</span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleUpgrade}
          disabled={isUpgrading}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold px-8 py-3 text-lg w-full"
        >
          {isUpgrading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Starting checkout...
            </>
          ) : (
            <>
              <Crown className="w-5 h-5 mr-2" />
              Get Premium Access Now
            </>
          )}
        </Button>
        
        <p className="text-xs text-emerald-600">
          Cancel anytime • Secure payment via Stripe • 30-day money-back guarantee
        </p>
      </CardContent>
    </Card>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="relative max-w-2xl w-full">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50">
      <main className="container mx-auto px-4 py-8">
        {content}
      </main>
    </div>
  );
};

export default PremiumFeatureGate;
