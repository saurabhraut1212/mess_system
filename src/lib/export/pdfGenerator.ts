import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { NextResponse } from 'next/server';

/**
 * Safe PDF generator for Next.js (no filesystem, no streams)
 */
export async function generatePDF<T extends Record<string, unknown>>(
  title: string,
  data: T[],
  fields: Array<Extract<keyof T, string>>
) {
  try {
    // ✅ Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Add a page
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const {  height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;

    let yPosition = height - 50;

    // --- Title ---
    page.drawText(title, {
      x: 50,
      y: yPosition,
      size: 18,
      font,
      color: rgb(0, 0.1, 0.6),
    });

    yPosition -= 30;

    // --- Header Row ---
    page.drawText(fields.join(' | '), {
      x: 50,
      y: yPosition,
      size: 13,
      font,
      color: rgb(0, 0, 0),
    });

    yPosition -= 20;

    // --- Data Rows ---
    for (const item of data) {
      const row = fields
        .map((f) => {
          const value = item[f];
          if (value instanceof Date) {
            return new Date(value).toLocaleDateString('en-IN');
          }
          return value !== undefined && value !== null ? String(value) : '';
        })
        .join(' | ');

      page.drawText(row, {
        x: 50,
        y: yPosition,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });

      yPosition -= 18;

      // ✅ Add new page if current one overflows
      if (yPosition < 50) {
        const newPage = pdfDoc.addPage([595, 842]);
        yPosition = height - 50;
        newPage.drawText(fields.join(' | '), {
          x: 50,
          y: yPosition,
          size: 13,
          font,
        });
        yPosition -= 20;
      }
    }

    // Serialize to bytes
    const pdfBytes = await pdfDoc.save();

    // ✅ Return as response
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${title.replace(/\s+/g, '_')}.pdf"`,
      },
    });
  } catch (err) {
    console.error('❌ PDF generation failed:', err);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: (err as Error).message },
      { status: 500 }
    );
  }
}
