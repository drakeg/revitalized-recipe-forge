
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import StarRating from "./StarRating";
import { Pencil, Trash2, Plus } from "lucide-react";

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

interface RecipeReviewsProps {
  recipeId: string;
  session?: any;
}

const RecipeReviews: React.FC<RecipeReviewsProps> = ({ recipeId, session }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
    fetchRatingStats();
  }, [recipeId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("recipe_ratings")
        .select(`
          *,
          profiles (first_name, last_name, username)
        `)
        .eq("recipe_id", recipeId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const reviewsData = data || [];
      setReviews(reviewsData);

      // Find current user's review
      if (session?.user?.id) {
        const currentUserReview = reviewsData.find(
          (review) => review.user_id === session.user.id
        );
        setUserReview(currentUserReview || null);
      }
    } catch (error: any) {
      console.error("Failed to fetch reviews:", error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRatingStats = async () => {
    try {
      const { data, error } = await supabase
        .rpc("get_recipe_rating_stats", { recipe_id_param: recipeId });

      if (error) throw error;

      if (data && data[0]) {
        setAverageRating(data[0].average_rating || 0);
        setTotalRatings(data[0].total_ratings || 0);
      }
    } catch (error: any) {
      console.error("Failed to fetch rating stats:", error);
    }
  };

  const handleSubmitReview = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to leave a review",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const reviewData = {
        recipe_id: recipeId,
        user_id: session.user.id,
        rating: newRating,
        review: newReviewText.trim() || null,
      };

      if (editingReview) {
        // Update existing review
        const { error } = await supabase
          .from("recipe_ratings")
          .update({
            rating: newRating,
            review: newReviewText.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingReview.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Review updated successfully",
        });
      } else {
        // Create new review
        const { error } = await supabase
          .from("recipe_ratings")
          .insert(reviewData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Review added successfully",
        });
      }

      // Reset form
      setNewRating(5);
      setNewReviewText("");
      setShowAddReview(false);
      setEditingReview(null);

      // Refresh data
      fetchReviews();
      fetchRatingStats();
    } catch (error: any) {
      console.error("Failed to submit review:", error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from("recipe_ratings")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Review deleted successfully",
      });

      fetchReviews();
      fetchRatingStats();
    } catch (error: any) {
      console.error("Failed to delete review:", error);
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      });
    }
  };

  const startEditing = (review: Review) => {
    setEditingReview(review);
    setNewRating(review.rating);
    setNewReviewText(review.review || "");
    setShowAddReview(true);
  };

  const cancelEditing = () => {
    setEditingReview(null);
    setNewRating(5);
    setNewReviewText("");
    setShowAddReview(false);
  };

  const getDisplayName = (profile: any) => {
    if (profile.first_name || profile.last_name) {
      return `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
    }
    if (profile.username) {
      return profile.username;
    }
    return "Anonymous User";
  };

  if (loading) {
    return <div className="text-center py-4">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Ratings & Reviews</span>
            {session && !userReview && (
              <Button
                onClick={() => setShowAddReview(true)}
                size="sm"
                className="flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Review
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-3xl font-bold text-emerald-700">
              {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
            </div>
            <div>
              <StarRating
                rating={averageRating}
                readonly
                size="lg"
                showCount
                count={totalRatings}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Review Form */}
      {showAddReview && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingReview ? "Edit Your Review" : "Add Your Review"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <StarRating
                rating={newRating}
                onRatingChange={setNewRating}
                size="lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Review (optional)
              </label>
              <Textarea
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                placeholder="Share your thoughts about this recipe..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="flex-1"
              >
                {submitting
                  ? "Submitting..."
                  : editingReview
                  ? "Update Review"
                  : "Submit Review"}
              </Button>
              <Button variant="outline" onClick={cancelEditing}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
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
                {session?.user?.id === review.user_id && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing(review)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteReview(review.id)}
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
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No reviews yet. Be the first to review this recipe!
        </div>
      )}
    </div>
  );
};

export default RecipeReviews;
