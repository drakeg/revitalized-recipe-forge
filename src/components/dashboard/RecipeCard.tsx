
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, Share2, ShoppingCart, Tag } from "lucide-react";
import { format } from "date-fns";
import StarRating from "@/components/rating/StarRating";

interface Recipe {
  id: string;
  title: string;
  analysis: string | null;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface RecipeCardProps {
  recipe: Recipe;
  categories: Category[];
  rating: { average: number; count: number };
  onView: (recipe: Recipe) => void;
  onEdit?: (recipe: Recipe) => void;
  onShare: (recipe: Recipe) => void;
  onDelete: (recipeId: string) => void;
  onAddToShoppingList?: (recipe: Recipe) => void;
  onManageCategories: (recipeId: string) => void;
  session?: any;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  categories,
  rating,
  onView,
  onEdit,
  onShare,
  onDelete,
  onAddToShoppingList,
  onManageCategories,
  session,
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-emerald-800 flex items-start justify-between">
          <span>{recipe.title}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onManageCategories(recipe.id)}
            className="text-emerald-600 hover:text-emerald-700 ml-2"
          >
            <Tag className="w-4 h-4" />
          </Button>
        </CardTitle>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {categories.map((category) => (
              <Badge 
                key={category.id} 
                variant="secondary"
                className="text-xs"
                style={{ 
                  backgroundColor: category.color + '20', 
                  color: category.color,
                  borderColor: category.color + '40'
                }}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rating Display */}
        {rating.count > 0 && (
          <div className="flex items-center gap-2">
            <StarRating
              rating={rating.average}
              readonly
              size="sm"
            />
            <span className="text-sm text-gray-600">
              ({rating.count})
            </span>
          </div>
        )}
        
        <p className="text-sm text-emerald-600">
          Created {format(new Date(recipe.created_at), "MMM d, yyyy")}
        </p>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(recipe)}
            className="flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            View
          </Button>
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(recipe)}
              className="flex items-center gap-1"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onShare(recipe)}
            className="flex items-center gap-1"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          {session && onAddToShoppingList && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddToShoppingList(recipe)}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to List
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(recipe.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeCard;
