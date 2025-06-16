
import React from "react";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, UserPlus, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { secureSignOut } from "@/utils/authUtils";

type NavbarProps = {
  loggedIn: boolean;
  userEmail?: string | null;
};

const Navbar: React.FC<NavbarProps> = ({ loggedIn, userEmail }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await secureSignOut();
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
              <span className="text-emerald-800 mr-3 hidden sm:inline text-sm font-semibold">
                {userEmail}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 border-emerald-400 text-emerald-900 hover:bg-emerald-100"
                onClick={() => navigate("/dashboard")}
              >
                <LayoutDashboard size={16} />
                Dashboard
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
