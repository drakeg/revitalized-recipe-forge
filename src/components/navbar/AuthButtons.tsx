
import React from "react";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";

interface AuthButtonsProps {
  onLogin: () => void;
  onSignup: () => void;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ onLogin, onSignup }) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1 text-emerald-900 border-emerald-400 hover:bg-emerald-100/70 transition-all"
        onClick={onLogin}
      >
        <LogIn size={16} />
        <span className="hidden sm:inline">Login</span>
      </Button>
      <Button
        variant="default"
        size="sm"
        className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white transition-all"
        onClick={onSignup}
      >
        <UserPlus size={16} />
        <span className="hidden sm:inline">Sign up</span>
      </Button>
    </div>
  );
};

export default AuthButtons;
