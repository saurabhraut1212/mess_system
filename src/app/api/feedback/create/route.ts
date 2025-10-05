import { NextRequest, NextResponse } from 'next/server';
import {connectDB} from '@/lib/db';
import Feedback from '@/models/Feedback';
import { verifyToken } from '@/lib/auth';
import Notification from '@/models/Notification';
import User from '@/models/User';

interface DecodedToken {
  id: string;
  role: string;
  email: string;
}

export async function POST(req: NextRequest) {
  await connectDB();
  const authHeader = req.headers.get('Authorization');
  if (!authHeader)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token) as DecodedToken;

    if (decoded.role !== 'customer') {
      return NextResponse.json(
        { error: 'Access denied: only users can add feedback' },
        { status: 403 }
      );
    }

    const { menu, order, rating, comment } = await req.json();

    if (!menu || !order || !rating) {
      return NextResponse.json(
        { error: 'Menu, Order, and Rating are required' },
        { status: 400 }
      );
    }

    const feedback = await Feedback.create({
      user: decoded.id,
      menu,
      order,
      rating,
      comment,
    });

    await Notification.create({
    user: decoded.id,
    title: 'Thank You for Your Feedback!',
    message: 'Your feedback has been submitted successfully.',
    type: 'feedback',
    });

    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
    await Notification.create({
        user: admin._id,
        title: 'New Feedback Received',
        message: `A user (${decoded.email}) has submitted feedback.`,
        type: 'feedback',
    });
    }

    return NextResponse.json(
      { message: 'Feedback submitted successfully', feedback },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
