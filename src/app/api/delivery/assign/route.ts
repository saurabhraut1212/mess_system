import { NextRequest, NextResponse } from 'next/server';
import {connectDB} from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import DeliveryAssignment from '@/models/DeliveryAssignment';
import Notification from '@/models/Notification';

interface DecodedToken {
  id: string;
  role: string;
}

export async function POST(req: NextRequest) {
  await connectDB();

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token) as DecodedToken;

    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can assign orders' }, { status: 403 });
    }

    const { orderId, deliveryBoyId } = await req.json();
    if (!orderId || !deliveryBoyId)
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const existing = await DeliveryAssignment.findOne({ order: orderId });
    if (existing)
      return NextResponse.json({ error: 'Order already assigned' }, { status: 400 });

    const assignment = await DeliveryAssignment.create({
      order: orderId,
      deliveryBoy: deliveryBoyId,
      status: 'assigned',
    });

    await Notification.create({
    user: deliveryBoyId,
    title: 'New Delivery Assigned',
    message: `You’ve been assigned to deliver Order #${orderId.slice(-6)}`,
    type: 'delivery',
    });

    return NextResponse.json({ message: 'Order assigned successfully', assignment });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
