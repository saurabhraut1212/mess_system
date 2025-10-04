import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
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
  if (!authHeader)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token) as DecodedToken;

    // ✅ Allow only 'user' role to place orders
    if (decoded.role !== 'customer') {
      return NextResponse.json(
        { error: 'Access denied: only users can place orders' },
        { status: 403 }
      );
    }

    // ✅ Validate body structure
    const body = await req.json();
    const { items, totalPrice } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    if (!totalPrice || typeof totalPrice !== 'number') {
      return NextResponse.json(
        { error: 'Invalid total price' },
        { status: 400 }
      );
    }

    // ✅ Create order
    const newOrder = await Order.create({
      user: decoded.id,
      items,
      totalPrice,
      status: 'pending',
    });

    return NextResponse.json(
      { message: 'Order placed successfully', order: newOrder },
      { status: 201 }
    );
  } catch (err) {
    console.error('Order creation error:', err);
    return NextResponse.json(
      { error: 'Server error while placing order' },
      { status: 500 }
    );
  }
}
