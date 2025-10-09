import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

interface DecodedToken {
  role: string;
}

export async function GET(req: NextRequest) {
  await connectDB();
  const authHeader = req.headers.get('Authorization');
  if (!authHeader)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token) as DecodedToken;

    if (decoded.role !== 'admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const deliveryBoys = await User.find({ role: 'delivery' }).select('name email');
    return NextResponse.json(deliveryBoys);
  } catch (err) {
    console.error('Delivery boys fetch error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
