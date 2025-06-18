
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, Calendar, ShoppingCart, Crown, LogOut } from "lucide-react";

interface DesktopNavigationProps {
  isPaid: boolean;
  loading: boolean;
  onDashboardClick: () => void;
  onMealPlansClick: () => void;
  onShoppingListsClick: () => void;
  onLogout: () => void;
  refreshSubscription: () => void;
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  isPaid,
  loading,
  onDashboardClick,
  onMealPlansClick,
  onShoppingListsClick,
  onLogout,
  refreshSubscription
}) => {
  return (
    <div className="flex items-center gap-2">
      {!loading && isPaid && (
        <Badge className="bg-yellow-500 text-yellow-900 hidden sm:flex">
          <Crown size={12} className="mr-1" /> Pro
        </Badge>
      )}

      <div className="hidden lg:flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 border-emerald-400 text-emerald-900 hover:bg-emerald-100"
          onClick={onDashboardClick}
        >
          <LayoutDashboard size={16} />
          Dashboard
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-1 border-emerald-400 text-emerald-900 hover:bg-emerald-100 relative ${!isPaid ? 'opacity-60' : ''}`}
          onClick={isPaid ? onMealPlansClick : undefined}
          disabled={!isPaid}
        >
          <Calendar size={16} />
          Meal Plans
          {!loading && !isPaid && <Crown size={12} className="text-yellow-600 ml-1" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-1 border-emerald-400 text-emerald-900 hover:bg-emerald-100 relative ${!isPaid ? 'opacity-60' : ''}`}
          onClick={isPaid ? onShoppingListsClick : undefined}
          disabled={!isPaid}
        >
          <ShoppingCart size={16} />
          Shopping
          {!loading && !isPaid && <Crown size={12} className="text-yellow-600 ml-1" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 text-emerald-900 hover:bg-yellow-100/80"
          onClick={onLogout}
        >
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default DesktopNavigation;
