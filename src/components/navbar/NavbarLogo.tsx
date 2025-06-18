
import React from "react";

interface NavbarLogoProps {
  onClick: () => void;
}

const NavbarLogo: React.FC<NavbarLogoProps> = ({ onClick }) => {
  return (
    <div 
      className="font-bold text-lg tracking-tight text-green-900 drop-shadow-sm flex gap-1 items-center cursor-pointer"
      onClick={onClick}
    >
      <span className="text-2xl">🍃</span> 
      <span className="hidden sm:inline">Revitalized Recipe Forge</span>
      <span className="sm:hidden">Recipe Forge</span>
    </div>
  );
};

export default NavbarLogo;
