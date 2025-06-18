
import React from "react";
import { Label } from "@/components/ui/label";

interface PreferenceSectionProps {
  title: string;
  children: React.ReactNode;
}

const PreferenceSection: React.FC<PreferenceSectionProps> = ({ title, children }) => {
  return (
    <div>
      <Label className="text-base font-semibold">{title}</Label>
      <div className="mt-2">
        {children}
      </div>
    </div>
  );
};

export default PreferenceSection;
