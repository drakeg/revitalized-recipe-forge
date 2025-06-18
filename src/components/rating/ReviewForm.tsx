
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "./StarRating";

interface ReviewFormProps {
  isEditing: boolean;
  rating: number;
  reviewText: string;
  submitting: boolean;
  onRatingChange: (rating: number) => void;
  onReviewTextChange: (text: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  isEditing,
  rating,
  reviewText,
  submitting,
  onRatingChange,
  onReviewTextChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit Your Review" : "Add Your Review"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Rating</label>
          <StarRating
            rating={rating}
            onRatingChange={onRatingChange}
            size="lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Review (optional)
          </label>
          <Textarea
            value={reviewText}
            onChange={(e) => onReviewTextChange(e.target.value)}
            placeholder="Share your thoughts about this recipe..."
            rows={4}
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onSubmit}
            disabled={submitting}
            className="flex-1"
          >
            {submitting
              ? "Submitting..."
              : isEditing
              ? "Update Review"
              : "Submit Review"}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
