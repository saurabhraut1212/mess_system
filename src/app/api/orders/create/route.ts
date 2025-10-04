import { NextRequest, NextResponse } from 'next/server';
import {connectDB} from '@/lib/db';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/auth';

interface DecodedToken {
    id: string;
    email: string;
    role: string;
}
export async function POST(req: NextRequest) {
  await connectDB();
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token) as DecodedToken;

    const { items, totalPrice } = await req.json();
    const order = await Order.create({ user: decoded.id, items, totalPrice, status: 'pending' });

    return NextResponse.json({ message: 'Order placed', order });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
