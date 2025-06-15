
import React from "react";

interface RecipeTextInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled: boolean;
}

const RecipeTextInput: React.FC<RecipeTextInputProps> = ({ value, onChange, disabled }) => (
  <div>
    <label
      htmlFor="recipe-text"
      className="block font-medium mb-1 text-green-900"
    >
      Paste Recipe Text
      <span className="text-muted-foreground ml-2">
        (or use file upload below)
      </span>
    </label>
    <textarea
      id="recipe-text"
      className="input w-full min-h-[100px] p-2 rounded-lg border mt-1 outline-none bg-background focus:ring-2 ring-emerald-400 placeholder:text-muted-foreground"
      placeholder="Paste your recipe here..."
      value={value}
      onChange={onChange}
      disabled={disabled}
      maxLength={4000}
    />
  </div>
);

export default RecipeTextInput;
