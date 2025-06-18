
import React from "react";
import { parseRecipeMarkdown } from "@/lib/parseRecipeMarkdown";
import { useRecipeUserStatus } from "@/hooks/useRecipeUserStatus";

interface RecipeAnalysisResultProps {
  result: string;
  session?: any;
}

const RecipeAnalysisResult: React.FC<RecipeAnalysisResultProps> = ({ result, session }) => {
  const { isPaid } = useRecipeUserStatus(session);
  
  // Parse the markdown result to extract different sections
  const { title, ingredients, instructions, nutritionTable } = parseRecipeMarkdown(result);

  // Disable text selection and copying for non-paid users
  const textStyle = !isPaid ? {
    userSelect: 'none' as const,
    WebkitUserSelect: 'none' as const,
    MozUserSelect: 'none' as const,
    msUserSelect: 'none' as const,
    WebkitTouchCallout: 'none' as const,
    WebkitTapHighlightColor: 'transparent'
  } : {};

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!isPaid) {
      e.preventDefault();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isPaid && (e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'a')) {
      e.preventDefault();
    }
  };

  return (
    <div 
      className="w-full space-y-6"
      style={textStyle}
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {!isPaid && (
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-yellow-800 text-sm">
          <strong>Preview Mode:</strong> Upgrade to a paid plan to save, copy, and access all features.
        </div>
      )}
      
      {/* Title */}
      {title && (
        <section>
          <h2 className="text-2xl font-bold text-emerald-800 mb-3">{title}</h2>
        </section>
      )}

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
  );
};

export default RecipeAnalysisResult;
