import { NextRequest, NextResponse } from 'next/server';
import {connectDB} from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import DeliveryAssignment from '@/models/DeliveryAssignment';
import Notification from '@/models/Notification';

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

    if (decoded.role !== 'delivery')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    const { assignmentId, status } = await req.json();
    if (!assignmentId || !status)
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });

    const validStatuses = ['assigned', 'picked-up', 'delivered'];
    if (!validStatuses.includes(status))
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });

    const updated = await DeliveryAssignment.findByIdAndUpdate(
      assignmentId,
      { status },
      { new: true }
    );

    await Notification.create({
    user: assignmentId.user,
    title: 'Delivery Update',
    message: `Your order is now ${status}.`,
    type: 'delivery',
    });

    return NextResponse.json({ message: 'Status updated', updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
