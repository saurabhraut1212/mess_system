import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import DeliveryAssignment from '@/models/DeliveryAssignment';
import '@/models/Order';

interface DecodedToken {
  id: string;
  role: 'customer' | 'admin' | 'delivery';
}

export async function GET(req: NextRequest) {
  await connectDB();

  const authHeader = req.headers.get('Authorization');
  if (!authHeader)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token) as DecodedToken;

    // ✅ Allow only delivery users
    if (decoded.role !== 'delivery')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    // ✅ Fetch assigned deliveries with full order + menu details
    const assignments = await DeliveryAssignment.find({
      deliveryBoy: decoded.id,
    })
      .populate({
        path: 'order',
        model: 'Order',
        populate: {
          path: 'items.menuId',
          model: 'Menu',
          select: 'name price category',
        },
      })
      .sort({ createdAt: -1 })
      .lean();

      console.log(assignments,'assignments');
    // ✅ Filter out null (in case order got deleted)
    const validAssignments = assignments.filter(a => a.order);

    return NextResponse.json(validAssignments);
  } catch (err) {
    console.error('❌ Error fetching delivery assignments:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
