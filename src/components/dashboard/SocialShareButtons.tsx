
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Facebook, Twitter, MessageCircle, Image } from "lucide-react";

interface SocialShareButtonsProps {
  shareUrl: string;
  shareTitle: string;
}

const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({
  shareUrl,
  shareTitle,
}) => {
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
  );
};

export default SocialShareButtons;
