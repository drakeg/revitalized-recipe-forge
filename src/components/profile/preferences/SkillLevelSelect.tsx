
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SkillLevelSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

const SkillLevelSelect: React.FC<SkillLevelSelectProps> = ({ value, onValueChange }) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select your skill level" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="beginner">Beginner</SelectItem>
        <SelectItem value="intermediate">Intermediate</SelectItem>
        <SelectItem value="advanced">Advanced</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SkillLevelSelect;
