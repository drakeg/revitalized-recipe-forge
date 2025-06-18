
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import StarRating from "./StarRating";
import { Pencil, Trash2 } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  review: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    username: string | null;
  };
}

interface ReviewCardProps {
  review: Review;
  currentUserId?: string;
  onEdit: (review: Review) => void;
  onDelete: (reviewId: string) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  currentUserId,
  onEdit,
  onDelete,
}) => {
  const getDisplayName = (profile: any) => {
    if (profile.first_name || profile.last_name) {
      return `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
    }
    if (profile.username) {
      return profile.username;
    }
    return "Anonymous User";
  };

  const isOwnReview = currentUserId === review.user_id;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {getDisplayName(review.profiles)
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">
                {getDisplayName(review.profiles)}
              </div>
              <div className="text-sm text-gray-500">
                {format(new Date(review.created_at), "MMM d, yyyy")}
              </div>
            </div>
          </div>
          {isOwnReview && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(review)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(review.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        <StarRating rating={review.rating} readonly />
        {review.review && (
          <p className="mt-3 text-gray-700">{review.review}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
