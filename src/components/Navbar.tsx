
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogIn, LogOut, UserPlus, LayoutDashboard, Calendar, ShoppingCart, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { secureSignOut } from "@/utils/authUtils";
import { useRecipeUserStatus } from "@/hooks/useRecipeUserStatus";
import { Session } from "@supabase/supabase-js";

type NavbarProps = {
  loggedIn: boolean;
  userEmail?: string | null;
  session?: Session | null;
};

const Navbar: React.FC<NavbarProps> = ({ loggedIn, userEmail, session }) => {
  const navigate = useNavigate();
  const { isPaid, loading } = useRecipeUserStatus(session);

  const handleLogout = async () => {
    await secureSignOut();
  };

  const handlePremiumFeatureClick = (feature: string) => {
    if (!loggedIn) {
      navigate("/auth");
      return;
    }
    if (!isPaid) {
      // TODO: Navigate to subscription page when implemented
      alert(`${feature} is available for paid subscribers only. Upgrade your account to access this feature!`);
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
              <span className="text-emerald-800 mr-3 hidden sm:inline text-sm font-semibold flex items-center gap-2">
                {userEmail}
                {!loading && isPaid && <Badge className="bg-yellow-500 text-yellow-900"><Crown size={12} /> Pro</Badge>}
              </span>
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
                className={`flex items-center gap-1 border-emerald-400 text-emerald-900 hover:bg-emerald-100 relative ${!isPaid && !loading ? 'opacity-75' : ''}`}
                onClick={() => handlePremiumFeatureClick("Meal Plans")}
              >
                <Calendar size={16} />
                Meal Plans
                {!loading && !isPaid && <Crown size={12} className="text-yellow-600 ml-1" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`flex items-center gap-1 border-emerald-400 text-emerald-900 hover:bg-emerald-100 relative ${!isPaid && !loading ? 'opacity-75' : ''}`}
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
  );
};

export default Navbar;
