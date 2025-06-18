
import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  count?: number;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  readonly = false,
  size = "md",
  showCount = false,
  count = 0,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleStarClick = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (!readonly) {
      setHoverRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center" onMouseLeave={handleMouseLeave}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeClasses[size],
              "transition-colors",
              !readonly && "cursor-pointer",
              star <= displayRating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            )}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
          />
        ))}
      </div>
      {showCount && count > 0 && (
        <span className="text-sm text-gray-600">
          ({count} review{count !== 1 ? "s" : ""})
        </span>
      )}
    </div>
  );
};

export default StarRating;
