
import React from "react";

const RecipeAnalysisResult: React.FC<{ result: string }> = ({ result }) => {
  return (
    <div className="w-full bg-white/80 border rounded-2xl shadow-lg px-6 py-4 my-6 text-left max-w-2xl mx-auto animate-fade-in">
      <h2 className="text-lg font-bold text-emerald-800 mb-2">Nutritional Analysis</h2>
      <div className="prose prose-emerald prose-sm sm:prose-base max-w-full" style={{ whiteSpace: "pre-wrap" }}>
        {/* Using dangerouslySetInnerHTML for markdown; replace if you add a markdown parser */}
        <div dangerouslySetInnerHTML={{ __html: result }} />
      </div>
    </div>
  );
};

export default RecipeAnalysisResult;
