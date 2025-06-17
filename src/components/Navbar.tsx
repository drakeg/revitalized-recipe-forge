
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogIn, LogOut, UserPlus, LayoutDashboard, Calendar, ShoppingCart, Crown, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { secureSignOut } from "@/utils/authUtils";
import { useRecipeUserStatus } from "@/hooks/useRecipeUserStatus";
import { Session } from "@supabase/supabase-js";
import PremiumModal from "./PremiumModal";

type NavbarProps = {
  loggedIn: boolean;
  userEmail?: string | null;
  session?: Session | null;
};

const Navbar: React.FC<NavbarProps> = ({ loggedIn, userEmail, session: propSession }) => {
  const navigate = useNavigate();
  
  // Use prop session if available, otherwise get it from the hook
  const { isPaid, loading, session: hookSession } = useRecipeUserStatus(propSession);
  const effectiveSession = propSession || hookSession;
  
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [modalFeature, setModalFeature] = useState({ name: "", description: "" });

  // Debug: Log Navbar props and state
  useEffect(() => {
    console.log('Navbar - Debug:', {
      loggedIn,
      userEmail,
      sessionExists: !!effectiveSession,
      sessionUserId: effectiveSession?.user?.id,
      isPaid,
      loading,
      timestamp: new Date().toISOString()
    });
  }, [loggedIn, userEmail, effectiveSession, isPaid, loading]);

  const handleLogout = async () => {
    await secureSignOut();
  };

  const handlePremiumFeatureClick = (feature: string) => {
    if (!loggedIn) {
      navigate("/auth");
      return;
    }
    if (!isPaid) {
      // Show premium modal instead of browser alert
      if (feature === "Meal Plans") {
        setModalFeature({
          name: "Meal Planning",
          description: "Plan your meals for the week, organize your cooking schedule, and create shopping lists automatically from your meal plans."
        });
      } else if (feature === "Shopping Lists") {
        setModalFeature({
          name: "Shopping Lists",
          description: "Create and manage your shopping lists, automatically generate them from your meal plans, and organize your grocery shopping efficiently."
        });
      }
      setShowPremiumModal(true);
      return;
    }
    // Navigate to the actual feature
    if (feature === "Meal Plans") {
      navigate("/meal-planning");
    } else if (feature === "Shopping Lists") {
      navigate("/shopping-lists");
    }
  };

  return (
    <>
      <nav className="w-full bg-gradient-to-r from-emerald-400/80 via-lime-200/70 to-yellow-100/90 border-b shadow-sm backdrop-blur">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <div 
            className="font-bold text-lg tracking-tight text-green-900 drop-shadow-sm flex gap-1 items-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <span className="text-2xl">🍃</span> Revitalized Recipe Forge
          </div>
          <div className="flex items-center gap-2">
            {!loggedIn ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-emerald-900 border-emerald-400 hover:bg-emerald-100/70 transition-all"
                  onClick={() => navigate("/auth")}
                >
                  <LogIn size={16} />
                  Login
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white transition-all"
                  onClick={() => navigate("/auth")}
                >
                  <UserPlus size={16} />
                  Sign up
                </Button>
              </>
            ) : (
              <>
                {!loading && isPaid && (
                  <Badge className="bg-yellow-500 text-yellow-900 mr-2">
                    <Crown size={12} className="mr-1" /> Pro
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 border-emerald-400 text-emerald-900 hover:bg-emerald-100"
                  onClick={() => navigate("/profile")}
                >
                  <User size={16} />
                  Profile
                </Button>
                {!loading && isPaid && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 border-emerald-400 text-emerald-900 hover:bg-emerald-100"
                    onClick={() => navigate("/dashboard")}
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-1 border-emerald-400 text-emerald-900 hover:bg-emerald-100 relative`}
                  onClick={() => handlePremiumFeatureClick("Meal Plans")}
                >
                  <Calendar size={16} />
                  Meal Plans
                  {!loading && !isPaid && <Crown size={12} className="text-yellow-600 ml-1" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-1 border-emerald-400 text-emerald-900 hover:bg-emerald-100 relative`}
                  onClick={() => handlePremiumFeatureClick("Shopping Lists")}
                >
                  <ShoppingCart size={16} />
                  Shopping
                  {!loading && !isPaid && <Crown size={12} className="text-yellow-600 ml-1" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-emerald-900 hover:bg-yellow-100/80"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <PremiumModal
        featureName={modalFeature.name}
        description={modalFeature.description}
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </>
  );
};

export default Navbar;
