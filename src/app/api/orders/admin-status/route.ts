import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import Notification from '@/models/Notification';
import { verifyToken } from '@/lib/auth';

interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

export async function PATCH(req: NextRequest) {
  await connectDB();

  const authHeader = req.headers.get('Authorization');
  if (!authHeader)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token) as DecodedToken;

    if (decoded.role !== 'admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { orderId, status } = await req.json();
    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    if (!['accepted', 'rejected'].includes(status))
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });

    order.status = status;
    await order.save();

    await Notification.create({
      user: order.user,
      title: `Order ${status === 'accepted' ? 'Accepted' : 'Rejected'}`,
      message:
        status === 'accepted'
          ? 'Your order has been accepted and will be assigned shortly.'
          : 'Your order was rejected by admin.',
      type: 'order',
    });

    return NextResponse.json({ message: `Order ${status}`, order });
  } catch (err) {
    console.error('Admin status error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
