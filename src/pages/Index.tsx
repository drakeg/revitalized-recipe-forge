
import React, { useState, useCallback } from "react";
import { Session } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import RecipeForm from "@/components/RecipeForm";
import HowItWorks from "@/components/HowItWorks";
import UpgradeBanner from "@/components/UpgradeBanner";
import { useRecipeUserStatus } from "@/hooks/useRecipeUserStatus";

interface IndexProps {
  session: Session | null;
}

const Index: React.FC<IndexProps> = ({ session }) => {
  const { isLoggedIn, isPaid } = useRecipeUserStatus(session);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50">
      <Navbar 
        loggedIn={!!session} 
        userEmail={session?.user?.email} 
        session={session} 
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* Upgrade Banner - Show prominently at the top */}
        <UpgradeBanner 
          isLoggedIn={!!session} 
          isPaid={isPaid} 
        />

        <div className="max-w-4xl mx-auto">
          <RecipeForm session={session} />
        </div>
        
        <HowItWorks />
      </main>
    </div>
  );
};

export default Index;
