import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";

/**
 * Professional tabular PDF generator (warning-free, no logic changes)
 */
export async function generatePDF<T extends Record<string, unknown>>(
  title: string,
  data: T[],
  fields: Array<Extract<keyof T, string>>
) {
  try {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595, 842]); // A4
    const { height, width } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const titleFontSize = 18;
    const headerFontSize = 12;
    const bodyFontSize = 11;

    let y = height - 60;
    const marginX = 40;
    const rowHeight = 20;
    const colWidth = (width - marginX * 2) / fields.length;

    // --- Title ---
    page.drawText(title, {
      x: marginX,
      y,
      size: titleFontSize,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.6),
    });
    y -= 30;

// --- Table Header Background ---
page.drawRectangle({
  x: marginX - 2,
  y: y - 4,
  width: width - marginX * 2 + 4,
  height: rowHeight,
  color: rgb(0.2, 0.4, 0.8),
  opacity: 0.85,
});

// --- Table Header Text ---
fields.forEach((field, i) => {
  page.drawText(field.toUpperCase(), {
    x: marginX + i * colWidth + 5,
    y,
    size: headerFontSize,
    font: boldFont,
    color: rgb(1, 1, 1),
  });
});

y -= rowHeight;

// --- Table Rows ---
let alternate = false;
for (const item of data) {
  const rowValues = fields.map((f) => {
    const value = item[f];
    if (value instanceof Date) return new Date(value).toLocaleDateString("en-IN");
    return value !== undefined && value !== null ? String(value) : "";
  });

  // Alternate background for better readability
  if (alternate) {
    page.drawRectangle({
      x: marginX - 2,
      y: y - 4,
      width: width - marginX * 2 + 4,
      height: rowHeight,
      color: rgb(0.93, 0.95, 0.98),
    });
  }

  // --- Draw Each Cell (Truncate Long Texts like IDs) ---
  rowValues.forEach((text, i) => {
    // Truncate long strings (like ObjectId)
    const maxChars = Math.floor(colWidth / 6); // rough char width
    const displayText =
      text.length > maxChars ? text.substring(0, maxChars - 3) + "..." : text;

    page.drawText(displayText, {
      x: marginX + i * colWidth + 5,
      y,
      size: bodyFontSize,
      font,
      color: rgb(0, 0, 0),
      maxWidth: colWidth - 10,
    });
  });

  y -= rowHeight;
  alternate = !alternate;

  // ✅ Page Break Logic (reuse `page`, no unused vars)
  if (y < 60) {
    page = pdfDoc.addPage([595, 842]);
    y = height - 80;
  }
}


    // Serialize and send as response
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${title
          .replace(/\s+/g, "_")
          .toLowerCase()}.pdf"`,
      },
    });
  } catch (err) {
    console.error("❌ PDF generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: (err as Error).message },
      { status: 500 }
    );
  }
}
