
import React from "react";
import { FileText, BookOpen, Upload, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

// Lively color palette for step accents
const ACCENTS = [
  "from-emerald-200 via-lime-100 to-yellow-50",
  "from-yellow-50 via-lime-200 to-emerald-100",
  "from-lime-100 via-amber-200 to-emerald-50",
  "from-emerald-100 via-yellow-100 to-white"
];

const steps = [
  {
    icon: <FileText className="text-emerald-500 mb-2" size={28} />,
    title: "Paste or Upload",
    text: "Copy/paste your recipe or upload a PDF, DOC, or TXT file.",
  },
  {
    icon: <BookOpen className="text-amber-600 mb-2" size={28} />,
    title: "Add a Title",
    text: "Give your recipe a descriptive title for easy searching.",
  },
  {
    icon: <Upload className="text-lime-600 mb-2" size={28} />,
    title: "Submit",
    text: "Submit your recipe for instant nutritional analysis.",
  },
  {
    icon: <UserPlus className="text-emerald-700 mb-2" size={28} />,
    title: "Register (Optional)",
    text: "Sign up to save, track, and organize all your recipes.",
  },
];

const HowItWorks: React.FC = () => (
  <section className="w-full max-w-3xl mx-auto mb-12">
    <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center text-emerald-800 drop-shadow">
      How it Works
    </h2>
    <div className="flex flex-col md:flex-row justify-center items-stretch gap-6">
      {steps.map((step, idx) => (
        <Card
          key={idx}
          className={`flex-1 flex flex-col items-center p-7 text-center border-2 ${["border-emerald-300","border-lime-300","border-amber-200","border-emerald-100"][idx]} shadow-lg rounded-2xl bg-gradient-to-br ${ACCENTS[idx]} hover:scale-105 hover:shadow-xl transition-all duration-200`}
        >
          <div className="mb-3">{step.icon}</div>
          <CardTitle className="mb-1 text-base text-green-900">{step.title}</CardTitle>
          <CardDescription className="text-green-800">{step.text}</CardDescription>
        </Card>
      ))}
    </div>
  </section>
);

export default HowItWorks;
