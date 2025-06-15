
import React from "react";
import { Button } from "@/components/ui/button";

interface RecipeFileInputProps {
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  disabled: boolean;
  acceptedFileTypes: string;
}

const RecipeFileInput: React.FC<RecipeFileInputProps> = ({
  file, onFileChange, onRemove, disabled, acceptedFileTypes
}) => (
  <div>
    <label
      htmlFor="recipe-file"
      className="block font-medium mb-1 text-green-900"
    >
      Upload Recipe File
      <span className="text-muted-foreground ml-2">
        (PDF, DOC, DOCX, TXT)
      </span>
    </label>
    <input
      id="recipe-file"
      type="file"
      accept={acceptedFileTypes}
      className="block w-full text-base file:bg-emerald-500 file:text-white file:rounded file:border-none file:py-2 file:px-4 file:font-medium file:cursor-pointer"
      onChange={onFileChange}
      disabled={disabled}
    />
    {file && (
      <div className="mt-2 text-sm text-muted-foreground">
        Selected: <span className="font-medium">{file.name}</span>
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

export default RecipeFileInput;
