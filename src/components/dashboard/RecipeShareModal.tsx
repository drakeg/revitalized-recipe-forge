
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import SocialShareButtons from "./SocialShareButtons";
import ShareLinkSection from "./ShareLinkSection";

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
  const { toast } = useToast();

  if (!recipe) return null;

  const shareUrl = `${window.location.origin}/recipe/${recipe.id}`;
  const shareTitle = `Check out this amazing recipe: ${recipe.title}`;

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
        
        <div className="space-y-6">
          <SocialShareButtons shareUrl={shareUrl} shareTitle={shareTitle} />
          <ShareLinkSection shareUrl={shareUrl} />

          {/* Quick Actions */}
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
