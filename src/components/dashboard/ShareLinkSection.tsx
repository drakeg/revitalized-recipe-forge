
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check } from "lucide-react";

interface ShareLinkSectionProps {
  shareUrl: string;
}

const ShareLinkSection: React.FC<ShareLinkSectionProps> = ({ shareUrl }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

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

  return (
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
  );
};

export default ShareLinkSection;
