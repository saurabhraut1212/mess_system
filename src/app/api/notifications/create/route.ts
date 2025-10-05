import { NextRequest, NextResponse } from 'next/server';
import {connectDB} from '@/lib/db';
import Notification from '@/models/Notification';
//import { verifyToken } from '@/lib/auth';

// interface DecodedToken {
//   id: string;
//   role: string;
// }

export async function POST(req: NextRequest) {
  await connectDB();
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    //const token = authHeader.split(' ')[1];
    // const decoded = verifyToken(token) as DecodedToken;

    const { user, title, message, type } = await req.json();
    if (!user || !title || !message)
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const notification = await Notification.create({
      user,
      title,
      message,
      type: type || 'system',
    });

    return NextResponse.json({ message: 'Notification created', notification });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
