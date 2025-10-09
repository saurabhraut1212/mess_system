import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import DeliveryAssignment from '@/models/DeliveryAssignment';
import Notification from '@/models/Notification';
import { verifyToken } from '@/lib/auth';

interface DecodedToken {
  id: string;
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

    const { orderId, deliveryBoyId } = await req.json();
    if (!orderId || !deliveryBoyId)
      return NextResponse.json({ error: 'Missing orderId or deliveryBoyId' }, { status: 400 });

    // ✅ 1️⃣ Find order
    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // ✅ 2️⃣ Update order status and assignment
    order.assignedTo = deliveryBoyId;
    order.status = 'assigned';
    await order.save();

    // ✅ 3️⃣ Create DeliveryAssignment (core link)
    const existingAssignment = await DeliveryAssignment.findOne({ order: orderId });
    if (!existingAssignment) {
      await DeliveryAssignment.create({
        order: orderId,
        deliveryBoy: deliveryBoyId,
        status: 'assigned',
      });
    }

    // ✅ 4️⃣ Notify delivery boy
    await Notification.create({
      user: deliveryBoyId,
      title: 'New Delivery Assigned 🚚',
      message: `You have been assigned to deliver order #${order.id.toString().slice(-5)}.`,
      type: 'order',
    });

    // ✅ 5️⃣ Notify customer
    await Notification.create({
      user: order.user,
      title: 'Order Out for Delivery 🚀',
      message: 'Your order has been assigned to a delivery partner.',
      type: 'order',
    });

    return NextResponse.json({ message: 'Delivery assigned successfully', order });
  } catch (err) {
    console.error('❌ Assign delivery error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
