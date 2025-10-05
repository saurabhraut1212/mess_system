import { NextRequest, NextResponse } from 'next/server';
import {connectDB} from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import User from '@/models/User';

interface DecodedToken {
  id: string;
  role: 'admin' | 'customer' | 'delivery';
}

export async function GET(req: NextRequest) {
  await connectDB();

  const authHeader = req.headers.get('Authorization');
  if (!authHeader)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token) as DecodedToken;

    // 🔒 Only admin can view delivery boys list
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied: only admins can view delivery boys' },
        { status: 403 }
      );
    }

    // ✅ Fetch only delivery boys
    const deliveryBoys = await User.find({ role: 'delivery' }, 'name email role').sort({
      name: 1,
    });

    return NextResponse.json(deliveryBoys);
  } catch (error) {
    console.error('Error fetching delivery boys:', error);
    return NextResponse.json(
      { error: 'Server error while fetching delivery boys' },
      { status: 500 }
    );
  }
}
