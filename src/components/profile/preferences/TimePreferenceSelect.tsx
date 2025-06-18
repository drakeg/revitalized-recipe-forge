
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimePreferenceSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

const TimePreferenceSelect: React.FC<TimePreferenceSelectProps> = ({ value, onValueChange }) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select your time preference" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="quick">Quick (&lt; 30 min)</SelectItem>
        <SelectItem value="medium">Medium (30-60 min)</SelectItem>
        <SelectItem value="long">Long (&gt; 60 min)</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default TimePreferenceSelect;
