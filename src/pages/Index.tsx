import React, { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import RecipeForm from "@/components/RecipeForm";
import HowItWorks from "@/components/HowItWorks";

// HEALTHIER: Public domain salad bowl with lots of greens
const FOOD_BG =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1500&q=80"; // salad bowl

const Index = () => {
  const [imgError, setImgError] = useState(false);
  const fallbackRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative min-h-screen flex flex-col w-full">
      {/* Full-screen background image */}
      <div
        className="fixed inset-0 z-0 w-full h-full pointer-events-none select-none"
        aria-hidden
      >
        <img
          src={imgError ? "" : FOOD_BG}
          alt="Healthy food background"
          className="absolute inset-0 w-full h-full object-cover object-center min-h-screen block"
          style={{
            filter: "brightness(0.94) blur(0.5px)",
            objectFit: "cover",
            objectPosition: "center",
            width: "100vw",
            height: "100vh",
            display: "block",
            backgroundColor: "#8ef58e",
            zIndex: 0,
          }}
          onError={() => setImgError(true)}
        />
        {/* Overlay: keep mostly transparent for visibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(236,253,245,0.38) 0%, rgba(254,242,200,0.18) 100%)",
            zIndex: 1,
          }}
        ></div>
        {/* Fallback if image fails */}
        {imgError && (
          <div
            ref={fallbackRef}
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{ zIndex: 2, background: "#e7fcb4" }}
          >
            <span className="bg-white/90 px-4 py-2 text-lg font-bold text-emerald-800 rounded-xl shadow-lg border border-emerald-400">
              Image failed to load.<br />
              Check your network connection or try a different image!
            </span>
          </div>
        )}
      </div>
      {/* site content (above background) */}
      <div className="relative z-10 min-h-screen flex flex-col w-full bg-transparent">
        <Navbar loggedIn={false} />
        <main className="flex-1 flex flex-col items-center justify-center px-4 pt-6">
          <RecipeForm />
          <HowItWorks />
        </main>
      </div>
    </div>
  );
};

export default Index;
