
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
import { Copy, Check, Facebook, Twitter, MessageCircle, Image } from "lucide-react";

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
  const shareTitle = `Check out this amazing recipe: ${recipe.title}`;
  const shareDescription = "Found this great recipe on Recipe Converter - thought you'd love it!";

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

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareTitle)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const text = `${shareTitle} ${shareUrl}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToPinterest = () => {
    const url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(shareTitle)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToWhatsApp = () => {
    const text = `${shareTitle} ${shareUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
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
          {/* Social Media Share Buttons */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Share on Social Media
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={shareToFacebook}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Facebook size={16} />
                Facebook
              </Button>
              <Button
                onClick={shareToTwitter}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-sky-200 text-sky-700 hover:bg-sky-50"
              >
                <Twitter size={16} />
                Twitter
              </Button>
              <Button
                onClick={shareToPinterest}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50"
              >
                <Image size={16} />
                Pinterest
              </Button>
              <Button
                onClick={shareToWhatsApp}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
              >
                <MessageCircle size={16} />
                WhatsApp
              </Button>
            </div>
          </div>

          {/* Share Link */}
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
