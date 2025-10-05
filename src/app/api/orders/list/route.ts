import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import '@/models/Menu';
import Order from '@/models/Order';

import { verifyToken } from '@/lib/auth';

interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

export async function GET(req: NextRequest) {
  await connectDB();
  const authHeader = req.headers.get('Authorization');
  if (!authHeader)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token) as DecodedToken;

    let orders;

    // 🧠 Role-based logic
    if (decoded.role === 'customer') {
      // Fetch only user's orders
      orders = await Order.find({ user: decoded.id })
        .populate('items.menuId')
        .sort({ createdAt: -1 }).lean();
    } else {
      // Fetch all orders (admin / manager)
      orders = await Order.find()
        .populate('items.menuId')
        .sort({ createdAt: -1 }).lean();
    }

    console.log(orders,'orders in api');
    return NextResponse.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
