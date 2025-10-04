import { NextRequest, NextResponse } from 'next/server';
import {connectDB} from '@/lib/db';
import Feedback from '@/models/Feedback';
import { verifyToken } from '@/lib/auth';

interface DecodedToken {
  id: string;
  role: string;
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

    return NextResponse.json(
      { message: 'Feedback submitted successfully', feedback },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
