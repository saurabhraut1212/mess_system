import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Order from '@/models/Order';
import { generateCSV } from '@/lib/export/csvGenerator';
import { generatePDF } from '@/lib/export/pdfGenerator';

interface DecodedToken {
  role: string;
}

// Type-safe revenue data
interface RevenueReport {
  [key: string]: string | number | undefined;
  status: string;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
}

export async function GET(req: NextRequest) {
  try {
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

    // --- Aggregate revenue data ---
    const orders = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          avgOrderValue: { $avg: '$totalPrice' },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    if (!orders || orders.length === 0)
      return NextResponse.json({ error: 'No orders found' }, { status: 404 });

    const data: RevenueReport[] = orders.map((o) => ({
      status: o._id,
      totalOrders: o.totalOrders,
      totalRevenue: o.totalRevenue,
      avgOrderValue: parseFloat(o.avgOrderValue.toFixed(2)),
    }));

    const fields: Array<Extract<keyof RevenueReport, string>> = [
      'status',
      'totalOrders',
      'totalRevenue',
      'avgOrderValue',
    ];

    if (format === 'pdf') {
      return generatePDF<RevenueReport>('Revenue Report', data, fields);
    }

    const csv = generateCSV<RevenueReport>(data, fields);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="revenue_report.csv"',
      },
    });
  } catch (err) {
    console.error('❌ Revenue report error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: (err as Error).message },
      { status: 500 }
    );
  }
}
