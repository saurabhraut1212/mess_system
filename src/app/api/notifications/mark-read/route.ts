import { NextRequest, NextResponse } from 'next/server';
import {connectDB} from '@/lib/db';
import Notification from '@/models/Notification';
import { verifyToken } from '@/lib/auth';

interface DecodedToken {
  id: string;
}

export async function PATCH(req: NextRequest) {
  await connectDB();
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token) as DecodedToken;

  const { notificationId } = await req.json();
  if (!notificationId)
    return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });

  await Notification.findOneAndUpdate(
    { _id: notificationId, user: decoded.id },
    { isRead: true }
  );

  return NextResponse.json({ message: 'Notification marked as read' });
}
