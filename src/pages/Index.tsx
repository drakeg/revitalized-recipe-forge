
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import RecipeForm from "@/components/RecipeForm";
import HowItWorks from "@/components/HowItWorks";

// The landing page: just a vertical stack of components, with background
const Index = () => {
  const [loggedIn] = useState(false);

  return (
    <div className="min-h-screen flex flex-col w-full bg-gradient-to-tr from-emerald-100 via-yellow-50 to-amber-50">
      <Navbar loggedIn={loggedIn} />

      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-6">
        <RecipeForm />
        <HowItWorks />
      </main>
      {/* Add: User's saved recipes if logged in, in the future */}
    </div>
  );
};

export default Index;
