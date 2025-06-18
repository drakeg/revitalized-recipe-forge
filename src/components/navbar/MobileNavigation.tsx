
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, Calendar, ShoppingCart, Crown, LogOut, Menu } from "lucide-react";

interface MobileNavigationProps {
  isPaid: boolean;
  loading: boolean;
  onDashboardClick: () => void;
  onMealPlansClick: () => void;
  onShoppingListsClick: () => void;
  onLogout: () => void;
  refreshSubscription: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isPaid,
  loading,
  onDashboardClick,
  onMealPlansClick,
  onShoppingListsClick,
  onLogout,
  refreshSubscription
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden relative">
      <Button
        variant="outline"
        size="sm"
        className="bg-emerald-100 border-emerald-400 text-emerald-900 hover:bg-emerald-200 px-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu size={18} />
      </Button>
      
      {isOpen && (
        <>
          {/* Backdrop to close menu when clicking outside */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute right-0 top-full mt-2 w-[280px] bg-white/95 backdrop-blur-sm shadow-lg border border-emerald-200 rounded-lg z-50">
            <div className="grid gap-3 p-4">
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
                onClick={() => {
                  onDashboardClick();
                  setIsOpen(false);
                }}
              >
                <LayoutDashboard size={16} className="mr-2" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                className={`justify-start ${!isPaid ? 'opacity-60' : ''}`}
                onClick={() => {
                  if (isPaid) {
                    onMealPlansClick();
                    setIsOpen(false);
                  }
                }}
                disabled={!isPaid}
              >
                <Calendar size={16} className="mr-2" />
                Meal Plans
                {!loading && !isPaid && <Crown size={12} className="text-yellow-600 ml-auto" />}
              </Button>
              <Button
                variant="ghost"
                className={`justify-start ${!isPaid ? 'opacity-60' : ''}`}
                onClick={() => {
                  if (isPaid) {
                    onShoppingListsClick();
                    setIsOpen(false);
                  }
                }}
                disabled={!isPaid}
              >
                <ShoppingCart size={16} className="mr-2" />
                Shopping Lists
                {!loading && !isPaid && <Crown size={12} className="text-yellow-600 ml-auto" />}
              </Button>
              <Button
                variant="ghost"
                className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MobileNavigation;
