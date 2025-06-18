import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import StarRating from "./StarRating";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import { Plus } from "lucide-react";

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
        <ReviewForm
          isEditing={!!editingReview}
          rating={newRating}
          reviewText={newReviewText}
          submitting={submitting}
          onRatingChange={setNewRating}
          onReviewTextChange={setNewReviewText}
          onSubmit={handleSubmitReview}
          onCancel={cancelEditing}
        />
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            currentUserId={session?.user?.id}
            onEdit={startEditing}
            onDelete={handleDeleteReview}
          />
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
