// This improved utility parses markdown returned by the backend into { title, ingredients, instructions, nutritionTable }.
// Now more robust to changes in markdown heading level and stray whitespace, and strips "Healthier" from titles.

export function parseRecipeMarkdown(result: string) {
  // Split into lines & clean up leading/trailing whitespace
  const lines = result.split('\n').map(l => l.trim()).filter(line => line.length > 0);

  let title = "";
  let ingredients: string[] = [];
  let instructions: string[] = [];
  let nutritionHeader = "";
  let nutritionTable: { headers: string[]; values: string[] } | null = null;

  let section: "title" | "ingredients" | "instructions" | "nutritionLabel" | null = null;
  let buffer: string[] = [];

  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i];

    // Recognize section headings (robust to markdown levels)
    if (/^#+\s*ingredients?/i.test(line)) {
      section = "ingredients";
      continue;
    }
    if (/^#+\s*instructions?/i.test(line)) {
      section = "instructions";
      continue;
    }
    if (/^#+\s*nutrition/i.test(line) || /nutrition facts/i.test(line)) {
      section = "nutritionLabel";
      continue;
    }
    // Only treat first non-empty line (not a heading or a section) as the recipe title
    if ((i === 0 && !/^#+/.test(line)) || (/^#+\s+/.test(line) && !/^#+\s*(ingredients?|instructions?|nutrition)/i.test(line))) {
      if (!title && !/ingredients?|instructions?|nutrition/i.test(line)) {
        title = line.replace(/^#+\s*/, "");
        continue;
      }
    }

    // Parse section content
    if (section === "ingredients") {
      // Collect bullet, numbered, or plain lines till next heading
      if (/^[-*]\s+/.test(line)) {
        ingredients.push(line.replace(/^[-*]\s+/, ""));
      } else if (/^\d+\.\s+/.test(line)) {
        ingredients.push(line.replace(/^\d+\.\s+/, ""));
      } else if (line && !/^#+/.test(line) && !/\|/.test(line)) {
        ingredients.push(line);
      }
      continue;
    }
    if (section === "instructions") {
      // Numbered or plain
      // Filter out line/section breaks
      if (
        line === "---" ||
        /^-{3,}$/.test(line) || // "---" or similar
        /^\*{3,}$/.test(line)   // "***" or similar
      ) {
        continue;
      }
      if (/^\d+\.\s+/.test(line)) {
        instructions.push(line.replace(/^\d+\.\s+/, ""));
      } else if (line && !/^#+/.test(line) && !/\|/.test(line)) {
        instructions.push(line);
      }
      continue;
    }
    if (section === "nutritionLabel") {
      // Skip separator/markdown-only lines (like |----|----|)
      if (
        line.includes('|') &&
        !/^(\s*\|?\s*-+\s*)+\|?\s*$/.test(line) // filters |----|-----| etc
      ) {
        buffer.push(line);
      }
    }
  }

  // Remove any "Healthier" prefix/casing in the title
  if (title && /^healthier\b.*$/i.test(title)) {
    title = title.replace(/^healthier\b\s*/i, "");
  }

  // Nutrition: parse markdown table (first is headers, subsequent rows are values)
  if (buffer.length > 1) {
    // Find the header row (usually first with at least one real word)
    const headerRow = buffer[0];
    // Find all value rows that aren't dashes
    const valueRows = buffer.slice(1).filter(
      l => l && !/^(\s*\|?\s*-+\s*)+\|?\s*$/.test(l)
    );
    const headers = headerRow.split('|').map(h => h.trim()).filter(Boolean);
    // Only use the first value row for current single-valued nutrition output
    let values: string[] = [];
    if (valueRows.length) {
      values = valueRows[0].split('|').map(v => v.trim()).filter(Boolean);
    }
    if (headers.length && values.length) {
      nutritionTable = { headers, values };
    }
  }

  // Debug: log parsing result
  console.log("parseRecipeMarkdown result", { title, ingredients, instructions, nutritionTable });

  return { title, ingredients, instructions, nutritionHeader, nutritionTable };
}
