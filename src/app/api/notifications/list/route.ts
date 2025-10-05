import { NextRequest, NextResponse } from 'next/server';
import {connectDB} from '@/lib/db';
import Notification from '@/models/Notification';
import { verifyToken } from '@/lib/auth';

interface DecodedToken {
  id: string;
}

export async function GET(req: NextRequest) {
  await connectDB();
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token) as DecodedToken;

  const notifications = await Notification.find({ user: decoded.id })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(notifications);
}
