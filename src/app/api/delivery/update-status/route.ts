import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import DeliveryAssignment from '@/models/DeliveryAssignment';
import Order from '@/models/Order';
import Notification from '@/models/Notification';

interface DecodedToken {
  id: string;
  role: 'customer' | 'admin' | 'delivery';
}

export async function PATCH(req: NextRequest) {
  await connectDB();

  const authHeader = req.headers.get('Authorization');
  if (!authHeader)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token) as DecodedToken;

    // ✅ Only delivery staff allowed
    if (decoded.role !== 'delivery')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    const { assignmentId, status } = await req.json();

    if (!assignmentId || !['picked-up', 'delivered'].includes(status))
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });

    // ✅ Find delivery assignment
    const assignment = await DeliveryAssignment.findById(assignmentId).populate('order');
    if (!assignment)
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });

    // ✅ Ensure this delivery belongs to the user
    if (assignment.deliveryBoy.toString() !== decoded.id)
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });

    // ✅ Update assignment status
    assignment.status = status;
    await assignment.save();

    // ✅ Update linked order status
   const order = await Order.findById(assignment.order);
    if (!order) {
      return NextResponse.json({ error: 'Linked order not found' }, { status: 404 });
    }

    order.status = status;
    await order.save();

    // ✅ Create notification for customer
    await Notification.create({
      user: order.user,
      title:
        status === 'picked-up'
          ? 'Your order has been picked up!'
          : 'Your order has been delivered 🎉',
      message:
        status === 'picked-up'
          ? 'Your food is on the way.'
          : 'Your food has been delivered successfully.',
      type: 'order',
    });

    return NextResponse.json({ message: 'Status updated successfully', assignment });
  } catch (err) {
    console.error('❌ Error updating delivery status:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
