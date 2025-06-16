
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { parseRecipeMarkdown } from "@/lib/parseRecipeMarkdown";

interface Recipe {
  id: string;
  title: string;
  analysis: string | null;
  created_at: string;
  updated_at: string;
}

interface RecipeViewModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

const RecipeViewModal: React.FC<RecipeViewModalProps> = ({
  recipe,
  isOpen,
  onClose,
}) => {
  if (!recipe || !recipe.analysis) return null;

  const { title, ingredients, instructions, nutritionTable } = parseRecipeMarkdown(recipe.analysis);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-emerald-800">
            {title || recipe.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Ingredients */}
          {ingredients.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold mb-3 text-green-900">Ingredients</h3>
              <ul className="list-disc ml-6 text-green-800 space-y-1">
                {ingredients.map((ingredient, i) => (
                  <li key={i}>{ingredient}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Instructions */}
          {instructions.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold mb-3 text-yellow-900">Instructions</h3>
              <ol className="list-decimal ml-6 text-yellow-900 space-y-2">
                {instructions.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </section>
          )}

          {/* Nutrition Table */}
          {nutritionTable && (
            <section>
              <h3 className="text-lg font-semibold uppercase tracking-wide text-lime-700 mb-3">
                Nutrition Facts
              </h3>
              <div className="overflow-x-auto rounded border border-lime-300 bg-lime-50 p-3">
                <table className="min-w-[280px] w-auto border-collapse font-mono text-lime-900">
                  <thead>
                    <tr>
                      {nutritionTable.headers.map((header, i) => (
                        <th
                          key={i}
                          className="border-b-2 border-lime-400 pb-1 text-left font-bold text-sm uppercase px-2"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {nutritionTable.rows.map((row, idx) => (
                      <tr key={idx}>
                        {row.map((val, i) => (
                          <td
                            key={i}
                            className="py-1 px-2 text-base font-semibold text-emerald-900"
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeViewModal;
