
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, X } from "lucide-react";

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
  const handleUpgrade = () => {
    // TODO: Navigate to subscription page when implemented
    console.log("Upgrade to premium clicked");
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
          Premium Feature: {featureName}
          <Sparkles className="w-6 h-6 text-yellow-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-emerald-600 text-lg">
          {description}
        </p>
        
        <div className="bg-white/70 rounded-lg p-6 border border-yellow-200">
          <h3 className="font-semibold text-emerald-800 mb-3">Premium Features Include:</h3>
          <ul className="text-left text-emerald-700 space-y-2">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              Advanced meal planning with weekly/monthly views
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              Automated shopping list generation from meal plans
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              Recipe categorization and advanced filtering
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              Priority customer support
            </li>
          </ul>
        </div>

        <Button
          onClick={handleUpgrade}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold px-8 py-3 text-lg"
        >
          <Crown className="w-5 h-5 mr-2" />
          Upgrade to Premium
        </Button>
        
        <p className="text-sm text-emerald-600">
          Already a premium subscriber? Please log out and log back in to refresh your account status.
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
