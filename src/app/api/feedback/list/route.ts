import { NextRequest, NextResponse } from 'next/server';
import {connectDB} from '@/lib/db';
import Feedback from '@/models/Feedback';
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

    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied: only admins can view feedback' },
        { status: 403 }
      );
    }

    const feedback = await Feedback.find()
      .populate('user', 'name email')
      .populate('menu', 'name')
      .populate('order', '_id')
      .sort({ createdAt: -1 });

    return NextResponse.json(feedback);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
