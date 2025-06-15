
import React from "react";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, UserPlus } from "lucide-react";

type NavbarProps = {
  loggedIn: boolean;
};

const Navbar: React.FC<NavbarProps> = ({ loggedIn }) => (
  <nav className="w-full bg-gradient-to-r from-emerald-400/80 via-lime-200/70 to-yellow-100/90 border-b shadow-sm backdrop-blur">
    <div className="container mx-auto flex items-center justify-between py-3 px-4">
      <div className="font-bold text-lg tracking-tight text-green-900 drop-shadow-sm flex gap-1 items-center">
        <span className="text-2xl">🍃</span> Revitalized Recipe Forge
      </div>
      <div className="flex items-center gap-2">
        {!loggedIn ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-emerald-900 border-emerald-400 hover:bg-emerald-100/70 transition-all"
            >
              <LogIn size={16} />
              Login
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white transition-all"
            >
              <UserPlus size={16} />
              Sign up
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 text-emerald-900 hover:bg-yellow-100/80"
            >
              <LogOut size={16} />
              Logout
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 border-emerald-400 text-emerald-900 hover:bg-emerald-100"
            >
              My Recipes
            </Button>
          </>
        )}
      </div>
    </div>
  </nav>
);

export default Navbar;
