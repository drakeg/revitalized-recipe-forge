
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Sparkles, Check } from "lucide-react";
import UpgradeButton from "./UpgradeButton";

interface UpgradeBannerProps {
  isLoggedIn: boolean;
  isPaid?: boolean;
}

const UpgradeBanner: React.FC<UpgradeBannerProps> = ({ isLoggedIn, isPaid }) => {
  if (isPaid) return null;

  return (
    <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
              <Crown className="w-6 h-6 text-yellow-600" />
              <h3 className="text-2xl font-bold text-emerald-800">Unlock Premium Features</h3>
              <Sparkles className="w-6 h-6 text-yellow-600" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Advanced meal planning</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Smart shopping lists</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Recipe categorization</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Priority support</span>
              </div>
            </div>
            
            <div className="text-center lg:text-left">
              <div className="text-3xl font-bold text-emerald-800">
                $9.99<span className="text-lg font-normal text-emerald-600">/month</span>
              </div>
              <div className="text-emerald-600 text-sm">Cancel anytime • 30-day money-back guarantee</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <UpgradeButton size="lg" className="px-8 py-3 text-lg" />
            {!isLoggedIn && (
              <div className="text-center">
                <p className="text-emerald-600 text-sm">
                  You can subscribe now and create an account during checkout,<br />
                  or <a href="/auth" className="underline font-medium">sign up first</a> for a personalized experience.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpgradeBanner;
