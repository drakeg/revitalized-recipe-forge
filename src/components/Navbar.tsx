
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { secureSignOut } from "@/utils/authUtils";
import { useRecipeUserStatus } from "@/hooks/useRecipeUserStatus";
import { Session } from "@supabase/supabase-js";
import NavbarLogo from "./navbar/NavbarLogo";
import AuthButtons from "./navbar/AuthButtons";
import DesktopNavigation from "./navbar/DesktopNavigation";
import MobileNavigation from "./navbar/MobileNavigation";
import PremiumModal from "./PremiumModal";

type NavbarProps = {
  loggedIn: boolean;
  userEmail?: string | null;
  session?: Session | null;
};

const Navbar: React.FC<NavbarProps> = ({ loggedIn, userEmail, session: propSession }) => {
  const navigate = useNavigate();
  
  // Use prop session if available, otherwise get it from the hook
  const { isPaid, loading, session: hookSession, refreshSubscription } = useRecipeUserStatus(propSession);
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

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <>
      <nav className="w-full bg-gradient-to-r from-emerald-400/80 via-lime-200/70 to-yellow-100/90 border-b shadow-sm backdrop-blur relative z-50">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <NavbarLogo onClick={() => handleNavClick("/")} />

          {!loggedIn ? (
            <AuthButtons 
              onLogin={() => navigate("/auth")}
              onSignup={() => navigate("/auth?view=signup")}
            />
          ) : (
            <>
              <DesktopNavigation
                isPaid={isPaid}
                loading={loading}
                onProfileClick={() => navigate("/account")}
                onDashboardClick={() => navigate("/dashboard")}
                onMealPlansClick={() => handlePremiumFeatureClick("Meal Plans")}
                onShoppingListsClick={() => handlePremiumFeatureClick("Shopping Lists")}
                onLogout={handleLogout}
                refreshSubscription={refreshSubscription}
              />
              <MobileNavigation
                isPaid={isPaid}
                loading={loading}
                onProfileClick={() => handleNavClick("/account")}
                onDashboardClick={() => handleNavClick("/dashboard")}
                onMealPlansClick={() => handlePremiumFeatureClick("Meal Plans")}
                onShoppingListsClick={() => handlePremiumFeatureClick("Shopping Lists")}
                onLogout={handleLogout}
                refreshSubscription={refreshSubscription}
              />
            </>
          )}
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
