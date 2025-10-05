import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Feedback from '@/models/Feedback';
import { generateCSV } from '@/lib/export/csvGenerator';
import { generatePDF } from '@/lib/export/pdfGenerator';
import { Types } from 'mongoose';

interface DecodedToken {
  id: string;
  name: string;
  role: string;
}

// ✅ Define interface with index signature for type safety
interface FeedbackReport {
  [key: string]: string | number | undefined;
  id: string;
  meal: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export async function GET(req: NextRequest) {
  await connectDB();

  const authHeader = req.headers.get('Authorization');
  if (!authHeader)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token) as DecodedToken;
  if (decoded.role !== 'admin')
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format') || 'csv';

  // Explicitly type populate for menu and user
  const feedback = await Feedback.find()
    .populate<{ menu: { _id: Types.ObjectId; name: string } }>('menu', 'name')
    .populate<{ user: { _id: Types.ObjectId; name: string; email: string } }>(
      'user',
      'name email'
    )
    .sort({ createdAt: -1 })
    .lean();

  // ✅ Type-safe map to FeedbackReport[]
  const data: FeedbackReport[] = feedback.map((f) => ({
    id: f._id.toString(),
    meal: f.menu?.name ?? 'N/A',
    user: f.user?.name ?? 'N/A',
    rating: f.rating ?? 0,
    comment: f.comment ?? '-',
    date: new Date(f.createdAt).toISOString().split('T')[0],
  }));

  const fields: Array<Extract<keyof FeedbackReport, string>> = [
    'id',
    'meal',
    'user',
    'rating',
    'comment',
    'date',
  ];

  if (format === 'pdf') {
    return generatePDF<FeedbackReport>('Feedback Report', data, fields);
  }

  const csv = generateCSV<FeedbackReport>(data, fields);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="feedback_report.csv"',
    },
  });
}
