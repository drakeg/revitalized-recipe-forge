
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { LogIn, LogOut, UserPlus, LayoutDashboard, Calendar, ShoppingCart, Crown, User, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { secureSignOut } from "@/utils/authUtils";
import { useRecipeUserStatus } from "@/hooks/useRecipeUserStatus";
import { Session } from "@supabase/supabase-js";
import { useIsMobile } from "@/hooks/use-mobile";
import PremiumModal from "./PremiumModal";
import SubscriptionManager from "./SubscriptionManager";

type NavbarProps = {
  loggedIn: boolean;
  userEmail?: string | null;
  session?: Session | null;
};

const Navbar: React.FC<NavbarProps> = ({ loggedIn, userEmail, session: propSession }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Use prop session if available, otherwise get it from the hook
  const { isPaid, loading, session: hookSession, refreshSubscription } = useRecipeUserStatus(propSession);
  const effectiveSession = propSession || hookSession;
  
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [modalFeature, setModalFeature] = useState({ name: "", description: "" });
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
    setShowMobileMenu(false);
  };

  const handlePremiumFeatureClick = (feature: string) => {
    setShowMobileMenu(false);
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
    setShowMobileMenu(false);
  };

  return (
    <>
      <nav className="w-full bg-gradient-to-r from-emerald-400/80 via-lime-200/70 to-yellow-100/90 border-b shadow-sm backdrop-blur relative z-50">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <div 
            className="font-bold text-lg tracking-tight text-green-900 drop-shadow-sm flex gap-1 items-center cursor-pointer"
            onClick={() => handleNavClick("/")}
          >
            <span className="text-2xl">🍃</span> 
            <span className="hidden sm:inline">Revitalized Recipe Forge</span>
            <span className="sm:hidden">Recipe Forge</span>
          </div>

          {!loggedIn ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-emerald-900 border-emerald-400 hover:bg-emerald-100/70 transition-all"
                onClick={() => navigate("/auth")}
              >
                <LogIn size={16} />
                <span className="hidden sm:inline">Login</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white transition-all"
                onClick={() => navigate("/auth?view=signup")}
              >
                <UserPlus size={16} />
                <span className="hidden sm:inline">Sign up</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {!loading && isPaid && (
                <Badge className="bg-yellow-500 text-yellow-900 hidden sm:flex">
                  <Crown size={12} className="mr-1" /> Pro
                </Badge>
              )}

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-2">
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
                <SubscriptionManager 
                  isPaid={isPaid} 
                  onRefreshStatus={refreshSubscription} 
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-emerald-900 hover:bg-yellow-100/80"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Logout
                </Button>
              </div>

              {/* Mobile/Tablet Navigation Menu */}
              <div className="lg:hidden">
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="bg-emerald-100 border-emerald-400 text-emerald-900 hover:bg-emerald-200">
                        <Menu size={16} />
                        <span className="ml-1 hidden sm:inline">Menu</span>
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="bg-white/95 backdrop-blur-sm shadow-lg border border-emerald-200 rounded-lg mt-2 z-50 right-0 left-auto">
                        <div className="grid gap-3 p-4 w-[300px]">
                          {!loading && isPaid && (
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-yellow-500 text-yellow-900">
                                <Crown size={12} className="mr-1" /> Pro
                              </Badge>
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            className="justify-start"
                            onClick={() => handleNavClick("/profile")}
                          >
                            <User size={16} className="mr-2" />
                            Profile
                          </Button>
                          {!loading && isPaid && (
                            <Button
                              variant="ghost"
                              className="justify-start"
                              onClick={() => handleNavClick("/dashboard")}
                            >
                              <LayoutDashboard size={16} className="mr-2" />
                              Dashboard
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            className="justify-start"
                            onClick={() => handlePremiumFeatureClick("Meal Plans")}
                          >
                            <Calendar size={16} className="mr-2" />
                            Meal Plans
                            {!loading && !isPaid && <Crown size={12} className="text-yellow-600 ml-auto" />}
                          </Button>
                          <Button
                            variant="ghost"
                            className="justify-start"
                            onClick={() => handlePremiumFeatureClick("Shopping Lists")}
                          >
                            <ShoppingCart size={16} className="mr-2" />
                            Shopping Lists
                            {!loading && !isPaid && <Crown size={12} className="text-yellow-600 ml-auto" />}
                          </Button>
                          <div className="pt-2 border-t">
                            <SubscriptionManager 
                              isPaid={isPaid} 
                              onRefreshStatus={refreshSubscription} 
                            />
                          </div>
                          <Button
                            variant="ghost"
                            className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={handleLogout}
                          >
                            <LogOut size={16} className="mr-2" />
                            Logout
                          </Button>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
            </div>
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
