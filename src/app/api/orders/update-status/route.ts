import { NextRequest, NextResponse } from 'next/server';
import {connectDB} from '@/lib/db';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/auth';

interface DecodedToken {
    id: string;
    email: string;
    role: string;
}
export async function PATCH(req: NextRequest) {
  await connectDB();
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token) as DecodedToken;
    if (decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { orderId, status } = await req.json();
    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    order.status = status;
    await order.save();

    return NextResponse.json({ message: 'Order status updated', order });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
