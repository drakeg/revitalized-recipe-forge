import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { User, LayoutDashboard, Calendar, ShoppingCart, Crown, LogOut, Menu } from "lucide-react";
import SubscriptionManager from "../SubscriptionManager";

interface MobileNavigationProps {
  isPaid: boolean;
  loading: boolean;
  onProfileClick: () => void;
  onDashboardClick: () => void;
  onMealPlansClick: () => void;
  onShoppingListsClick: () => void;
  onLogout: () => void;
  refreshSubscription: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isPaid,
  loading,
  onProfileClick,
  onDashboardClick,
  onMealPlansClick,
  onShoppingListsClick,
  onLogout,
  refreshSubscription
}) => {
  return (
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
                  onClick={onProfileClick}
                >
                  <User size={16} className="mr-2" />
                  Account
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={onMealPlansClick}
                >
                  <Calendar size={16} className="mr-2" />
                  Meal Plans
                  {!loading && !isPaid && <Crown size={12} className="text-yellow-600 ml-auto" />}
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={onShoppingListsClick}
                >
                  <ShoppingCart size={16} className="mr-2" />
                  Shopping Lists
                  {!loading && !isPaid && <Crown size={12} className="text-yellow-600 ml-auto" />}
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={onLogout}
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
  );
};

export default MobileNavigation;
