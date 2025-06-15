
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import RecipeForm from "@/components/RecipeForm";
import HowItWorks from "@/components/HowItWorks";

// New, light, healthy food background image from Unsplash (bowl of fruit/veggies)
// This is bright, colorful, and better reflects a healthy lifestyle
const FOOD_BG =
  "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=1500&q=80";

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
          style={{
            filter: "brightness(0.92) blur(0.5px)",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
        {/* Updated overlay: softer, more "fresh" transparency for healthy theme */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(236,253,245,0.65) 0%, rgba(254,242,200,0.40) 100%)",
            mixBlendMode: "multiply",
          }}
        ></div>
        {/* Gentle white vignette for contrast and care */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 60% 25%, rgba(244,255,234,0.12) 0%, rgba(244,255,234,0.04) 55%, rgba(255,255,255,0) 100%)",
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
