
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Recipe {
  id: string;
  title: string;
  analysis: string | null;
  created_at: string;
  updated_at: string;
}

interface DashboardStatsProps {
  recipes: Recipe[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ recipes }) => {
  const totalRecipes = recipes.length;
  const thisWeek = recipes.filter(recipe => {
    const recipeDate = new Date(recipe.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return recipeDate >= weekAgo;
  }).length;

  const thisMonth = recipes.filter(recipe => {
    const recipeDate = new Date(recipe.created_at);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return recipeDate >= monthAgo;
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Recipes</CardTitle>
          <span className="text-2xl">📚</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-700">{totalRecipes}</div>
          <p className="text-xs text-muted-foreground">
            All time collection
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <span className="text-2xl">📅</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-700">{thisWeek}</div>
          <p className="text-xs text-muted-foreground">
            Recipes added recently
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <span className="text-2xl">🗓️</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-700">{thisMonth}</div>
          <p className="text-xs text-muted-foreground">
            Monthly progress
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
