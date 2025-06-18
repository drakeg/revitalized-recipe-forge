
import React from "react";
import { Session } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Crown, Settings, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileForm from "@/components/profile/ProfileForm";
import SubscriptionManager from "@/components/SubscriptionManager";
import PremiumFeatureGate from "@/components/PremiumFeatureGate";
import { useProfileData } from "@/hooks/useProfileData";
import { useRecipeUserStatus } from "@/hooks/useRecipeUserStatus";

type AccountProps = {
  session: Session | null;
};

const Account: React.FC<AccountProps> = ({ session }) => {
  const navigate = useNavigate();
  const { isPaid, loading: subscriptionLoading, refreshSubscription } = useRecipeUserStatus(session);
  const {
    loading: profileLoading,
    saving,
    formData,
    handleInputChange,
    handleSave,
  } = useProfileData(session);

  if (profileLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50">
        <Navbar 
          loggedIn={!!session} 
          userEmail={session?.user?.email} 
          session={session} 
        />
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50">
      <Navbar 
        loggedIn={!!session} 
        userEmail={session?.user?.email} 
        session={session} 
      />
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="grid gap-6">
          {/* Profile Section */}
          <Card>
            <ProfileHeader />
            <CardContent>
              <ProfileForm
                formData={formData}
                saving={saving}
                onInputChange={handleInputChange}
                onSubmit={handleSave}
              />
            </CardContent>
          </Card>

          {/* Subscription Management Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Subscription Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPaid ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Crown className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Premium Subscriber</span>
                  </div>
                  <SubscriptionManager 
                    isPaid={isPaid} 
                    onRefreshStatus={refreshSubscription} 
                  />
                </div>
              ) : (
                <PremiumFeatureGate
                  featureName="Subscription Management"
                  description="Manage your subscription, billing, and premium features."
                />
              )}
            </CardContent>
          </Card>

          {/* Dashboard Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5" />
                Recipe Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPaid ? (
                <div className="space-y-4">
                  <p className="text-emerald-600">
                    Access your full recipe dashboard with advanced features.
                  </p>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Go to Dashboard
                  </button>
                </div>
              ) : (
                <PremiumFeatureGate
                  featureName="Recipe Dashboard"
                  description="Access your complete recipe collection with advanced organization, categorization, and management tools."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Account;
