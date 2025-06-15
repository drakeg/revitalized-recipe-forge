
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import RecipeForm from "@/components/RecipeForm";
import HowItWorks from "@/components/HowItWorks";

// HEALTHIER: Colorful salad bowl (public domain) - you may swap this for any preferred healthy image!
const FOOD_BG =
  "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=1500&q=80";

const Index = () => {
  const [loggedIn] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col w-full">
      {/* Full-screen background image with debug styling */}
      <div
        className="fixed inset-0 z-0 w-full h-full pointer-events-none select-none border-4 border-emerald-400"
        aria-hidden
      >
        <img
          src={FOOD_BG}
          alt="Healthy food background: Bowl of fruit and veggies"
          className="absolute inset-0 w-full h-full object-cover object-center min-h-screen block"
          style={{
            filter: "brightness(0.92) blur(0.5px)",
            objectFit: "cover",
            objectPosition: "center",
            width: "100vw",
            height: "100vh",
            display: "block",
            backgroundColor: "#8ef58e", // bright green fallback
            zIndex: 0,
          }}
        />
        {/* Overlay: Transparent so image is visible! */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(236,253,245,0.45) 0%, rgba(254,242,200,0.27) 100%)",
            zIndex: 1,
          }}
        ></div>
        {/* Fallback for debugging if image fails */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ zIndex: 2 }}>
          <span className="bg-white/80 px-4 py-2 text-lg font-bold text-emerald-800 rounded-xl shadow-lg">
            If you see this, the image didn't load.
          </span>
        </div>
      </div>
      {/* site content (above background) */}
      <div className="relative z-10 min-h-screen flex flex-col w-full bg-transparent">
        <Navbar loggedIn={loggedIn} />
        <main className="flex-1 flex flex-col items-center justify-center px-4 pt-6">
          <RecipeForm />
          <HowItWorks />
        </main>
      </div>
    </div>
  );
};

export default Index;

