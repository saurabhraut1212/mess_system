import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Order from '@/models/Order';
import { generateCSV } from '@/lib/export/csvGenerator';
import { generatePDF } from '@/lib/export/pdfGenerator';
import { Types } from 'mongoose';

interface DecodedToken {
  role: string;
}


interface OrderReport {
  [key: string]: string | number | undefined;
  id: string;
  customer: string;
  email: string;
  totalPrice: number;
  status: string;
  createdAt: string;
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

  // Explicitly type populate to inform TS of expected user fields
  const orders = await Order.find()
    .populate<{ user: { _id: Types.ObjectId; name: string; email: string } }>(
      'user',
      'name email'
    )
    .sort({ createdAt: -1 })
    .lean();

  // Properly type the mapped data
 const data: OrderReport[] = orders.map(o => ({
  id: o._id.toString(),
  customer: o.user?.name ?? 'N/A',
  email: o.user?.email ?? 'N/A',
  totalPrice: o.totalPrice,
  status: o.status,
  createdAt: new Date(o.createdAt).toISOString().split('T')[0],
}));

  // Field keys typed from the interface
 const fields: Array<Extract<keyof OrderReport, string>> = [
  'id','customer','email','totalPrice','status','createdAt'
];

if (format === 'pdf') {
  return generatePDF<OrderReport>('Order Report', data, fields);
}

const csv = generateCSV<OrderReport>(data, fields);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="orders_report.csv"',
    },
  });
}
