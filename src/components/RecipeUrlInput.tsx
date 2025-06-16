
import React from "react";
import { Button } from "@/components/ui/button";

interface RecipeUrlInputProps {
  url: string;
  onUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  disabled: boolean;
}

const RecipeUrlInput: React.FC<RecipeUrlInputProps> = ({
  url, onUrlChange, onRemove, disabled
}) => (
  <div>
    <label
      htmlFor="recipe-url"
      className="block font-medium mb-1 text-green-900"
    >
      Recipe URL
      <span className="text-muted-foreground ml-2">
        (from recipe websites)
      </span>
    </label>
    <input
      id="recipe-url"
      type="url"
      className="input w-full p-2 rounded-lg border mt-1 outline-none bg-background focus:ring-2 ring-emerald-400 placeholder:text-muted-foreground"
      placeholder="https://example.com/recipe-link"
      value={url}
      onChange={onUrlChange}
      disabled={disabled}
    />
    {url && (
      <div className="mt-2 text-sm text-muted-foreground">
        URL: <span className="font-medium">{url}</span>
        <Button
          variant="ghost"
          size="sm"
          className="ml-2 px-2 py-0 text-xs text-emerald-800 hover:bg-yellow-100"
          type="button"
          onClick={onRemove}
        >
          Remove
        </Button>
      </div>
    )}
  </div>
);

export default RecipeUrlInput;
