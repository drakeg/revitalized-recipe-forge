
import React from "react";
import { parseRecipeMarkdown } from "@/lib/parseRecipeMarkdown";

// The returned analysis result is markdown: to modernize, parse and format.
const RecipeAnalysisResult: React.FC<{ result: string }> = ({ result }) => {
  const { title, ingredients, instructions, nutritionHeader, nutritionTable } = parseRecipeMarkdown(result);

  return (
    <div className="w-full bg-white/90 border rounded-2xl shadow-lg px-6 py-7 my-6 text-left max-w-2xl mx-auto animate-fade-in flex flex-col gap-4">
      {/* Clean Title Heading */}
      {title && <h2 className="text-2xl font-bold text-emerald-800 mb-1 drop-shadow">{title}</h2>}
      {/* Ingredients */}
      {ingredients.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-2 text-green-900">Ingredients</h3>
          <ul className="list-disc ml-6 text-green-800 text-base mb-3">
            {ingredients.map((ingredient, i) => (
              <li key={i}>{ingredient}</li>
            ))}
          </ul>
        </section>
      )}
      {/* Instructions */}
      {instructions.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-2 text-yellow-900">Instructions</h3>
          <ol className="list-decimal ml-6 text-yellow-900 text-base space-y-1 mb-3">
            {instructions.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>
      )}
      {/* Nutrition Label */}
      {nutritionTable && (
        <section>
          <h3 className="text-base font-semibold uppercase tracking-wide text-lime-700 mb-2">Nutrition Facts</h3>
          <div className="overflow-x-auto rounded border border-lime-300 bg-lime-50 p-3 max-w-full shadow-inner">
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
                <tr>
                  {nutritionTable.values.map((val, i) => (
                    <td
                      key={i}
                      className="py-1 px-2 text-base font-semibold text-emerald-900"
                    >
                      {val}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default RecipeAnalysisResult;
