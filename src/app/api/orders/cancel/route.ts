import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import Notification from '@/models/Notification';
import { verifyToken } from '@/lib/auth';

interface DecodedToken {
  id: string;
  role: string;
  email: string;
}

export async function PATCH(req: NextRequest) {
  await connectDB();

  const authHeader = req.headers.get('Authorization');
  if (!authHeader)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token) as DecodedToken;

    const { orderId } = await req.json();
    if (!orderId)
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });

    // ✅ Fetch order
    const order = await Order.findById(orderId);
    if (!order)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // ✅ Only the owner of this order can cancel it
    if (order.user.toString() !== decoded.id)
      return NextResponse.json({ error: 'Unauthorized: Not your order' }, { status: 403 });

    // ✅ Prevent cancellation if already accepted/rejected
    if (order.status === 'accepted' || order.status === 'rejected' )
      return NextResponse.json(
        { error: 'You can only cancel orders that are pending' },
        { status: 400 }
      );

    // ✅ Update order
    order.status = 'cancelled';
    order.cancelledBy = 'customer';
    await order.save();

    // ✅ Create customer notification
    await Notification.create({
      user: order.user,
      title: 'Order Cancelled',
      message: `Your order #${order.id.toString().slice(-5)} has been cancelled successfully.`,
      type: 'order',
    });

    // ✅ Notify all admins about cancellation
    await Notification.create({
      user: order.user, // null indicates admin notification
      title: 'Order Cancelled by Customer',
      message: `Customer (${decoded.email}) cancelled order #${order.id.toString().slice(-5)}.`,
      type: 'order',
    });

    return NextResponse.json({ message: 'Order cancelled successfully', order });
  } catch (err) {
    console.log(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
