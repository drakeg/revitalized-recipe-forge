
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface RecipeFiltersProps {
  searchTerm: string;
  selectedCategory: string;
  categories: Category[];
  filteredCount: number;
  totalCount: number;
  onSearchChange: (term: string) => void;
  onCategoryChange: (category: string) => void;
  onClearFilters: () => void;
}

const RecipeFilters: React.FC<RecipeFiltersProps> = ({
  searchTerm,
  selectedCategory,
  categories,
  filteredCount,
  totalCount,
  onSearchChange,
  onCategoryChange,
  onClearFilters,
}) => {
  const hasActiveFilters = searchTerm || selectedCategory !== "all";

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Showing {filteredCount} of {totalCount} recipes
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-emerald-600 hover:text-emerald-700"
          >
            <X className="w-4 h-4 mr-1" />
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecipeFilters;
