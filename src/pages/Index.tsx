
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import RecipeForm from "@/components/RecipeForm";
import HowItWorks from "@/components/HowItWorks";

// Food background image from Unsplash (as in RecipeForm)
const FOOD_BG =
  "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=1500&q=80";

// The landing page: food imagery covers the whole page, with overlay
const Index = () => {
  const [loggedIn] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col w-full">
      {/* Full-screen background image */}
      <div
        className="fixed inset-0 z-0 w-full h-full pointer-events-none select-none"
        aria-hidden
      >
        <img
          src={FOOD_BG}
          alt=""
          className="w-full h-full object-cover object-center min-h-screen"
          style={{ filter: "brightness(0.67) blur(0.5px)" }}
        />
        {/* Soft colored overlay for readability */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(254,242,200,0.54) 0%, rgba(236,253,245,0.64) 100%)",
            mixBlendMode: "multiply",
          }}
        ></div>
        {/* Very subtle dark radial vignette for contrast */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 60% 25%, rgba(0,0,0,0.09) 0%, rgba(0,0,0,0.04) 65%, rgba(0,0,0,0) 100%)",
          }}
        ></div>
      </div>
      {/* site content (above background) */}
      <div className="relative z-10 min-h-screen flex flex-col w-full bg-transparent">
        <Navbar loggedIn={loggedIn} />

        <main className="flex-1 flex flex-col items-center justify-center px-4 pt-6">
          <RecipeForm />
          <HowItWorks />
        </main>
        {/* Add: User's saved recipes if logged in, in the future */}
      </div>
    </div>
  );
};

export default Index;
