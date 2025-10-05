import { Parser, FieldInfo } from "json2csv";

/**
 * Generate safe CSV — prevents Excel "###" display issue for date columns
 */
export function generateCSV<T extends { [k: string]: unknown }>(
  data: T[],
  fields: Array<Extract<keyof T, string>>
): string {
  try {
    // Sanitize data for Excel-friendly export
    const sanitizedData = data.map((row) => {
      const newRow: Record<string, string> = {};
      for (const key of Object.keys(row)) {
        let value = row[key];

        // ✅ Fix 1: stringify dates clearly
        if (value instanceof Date) {
          value = value.toISOString().split("T")[0];
        }

        // ✅ Fix 2: prevent Excel interpreting as number (prefix tab)
        if (
          typeof value === "string" &&
          /^\d{4}-\d{2}-\d{2}$/.test(value)
        ) {
          value = `\t${value}`; // forces Excel to treat as text
        }

        newRow[key] =
          value !== undefined && value !== null ? String(value) : "";
      }
      return newRow;
    });

    const parser = new Parser({
      fields: fields.map((f) => f.toString()) as (string | FieldInfo<T>)[],
    });
    return parser.parse(sanitizedData as T[]);
  } catch (err) {
    console.error("❌ CSV Generation Error:", err);
    throw new Error("Failed to generate CSV");
  }
}
