
// This utility parses markdown returned by the backend into { title, ingredients, instructions, nutritionTable }
// It handles common heading conventions and parses a markdown-style nutrition table if present.

export function parseRecipeMarkdown(result: string) {
  // Split lines and clean
  const lines = result.split('\n').map(l => l.trim()).filter(Boolean);

  let title = "";
  let ingredients: string[] = [];
  let instructions: string[] = [];
  let nutritionHeader = "";
  let nutritionTable: { headers: string[]; values: string[] } | null = null;

  let section: "title" | "ingredients" | "instructions" | "nutrition" | null = null;
  let buffer: string[] = [];

  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i];

    // Find section headings (markdown conventions, for robustness)
    if (/^#? ?ingredients/i.test(line)) {
      section = "ingredients";
      continue;
    }
    if (/^#? ?instructions/i.test(line)) {
      section = "instructions";
      continue;
    }
    if (/^#? ?nutrition/i.test(line)) {
      section = "nutrition";
      continue;
    }
    // Main title on first line(s)
    if ((i === 0 && line.length > 0 && !line.startsWith('-') && !line.startsWith('|')) || (/^# [^#]/.test(line))) {
      if (!title && !/ingredients|instructions|nutrition/i.test(line)) {
        title = line.replace(/^# */, "");
        continue;
      }
    }

    // Section content
    if (section === "ingredients") {
      // Bullets, list, or plain - greedy until instructions or next heading
      if (line.startsWith('- ') || line.startsWith('* ') || line.match(/^\d+\. /)) {
        ingredients.push(line.replace(/^([-*] |\d+\.\s)/, ''));
      } else if (line && !line.startsWith('|')) {
        ingredients.push(line);
      }
      continue;
    }
    if (section === "instructions") {
      // Numbered steps or lines
      if (line.match(/^\d+\./)) {
        instructions.push(line.replace(/^\d+\.\s*/, ''));
      } else if (line.length > 2 && !line.startsWith('|')) {
        instructions.push(line);
      }
      continue;
    }
    if (section === "nutrition") {
      // Parse | table
      if (line.includes('|')) buffer.push(line);
    }
  }

  // Nutrition: parse first table in buffer (| Calories | Carbs |...)
  if (buffer.length > 1 && buffer[0].includes('|')) {
    // First row: headers, second: values
    const headerRow = buffer[0];
    const valueRow = buffer.find(l => l !== headerRow && l.includes('|'));
    if (headerRow && valueRow) {
      const headers = headerRow.split('|').map(h => h.trim()).filter(Boolean);
      const values = valueRow.split('|').map(v => v.trim()).filter(Boolean);
      if (headers.length && values.length) {
        nutritionTable = { headers, values };
      }
    }
  }

  return { title, ingredients, instructions, nutritionHeader, nutritionTable };
}
