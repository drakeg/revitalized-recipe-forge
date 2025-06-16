
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check } from "lucide-react";

interface Recipe {
  id: string;
  title: string;
  analysis: string | null;
  created_at: string;
  updated_at: string;
}

interface RecipeShareModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const RecipeShareModal: React.FC<RecipeShareModalProps> = ({
  recipe,
  isOpen,
  onClose,
  onRefresh,
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!recipe) return null;

  const shareUrl = `${window.location.origin}/recipe/${recipe.id}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Recipe link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const copyRecipeText = async () => {
    if (!recipe.analysis) return;
    
    try {
      await navigator.clipboard.writeText(recipe.analysis);
      toast({
        title: "Copied!",
        description: "Recipe text copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy recipe text",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-emerald-800">
            Share Recipe: {recipe.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="share-url" className="text-sm font-medium">
              Share Link
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="share-url"
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Anyone with this link can view your recipe
            </p>
          </div>

          <div className="border-t pt-4">
            <Label className="text-sm font-medium">Quick Actions</Label>
            <div className="flex gap-2 mt-2">
              <Button
                onClick={copyRecipeText}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Copy Recipe Text
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <Button onClick={onClose} className="w-full">
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeShareModal;
