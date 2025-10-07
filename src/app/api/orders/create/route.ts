import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import Menu from '@/models/Menu';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

interface OrderItemInput {
  menuId: string;
  quantity?: number;
  instructions?: string;
  addons?: string[];
}

export async function POST(req: NextRequest) {
  await connectDB();

  const authHeader = req.headers.get('Authorization');
  if (!authHeader)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token) as DecodedToken;

    if (decoded.role !== 'customer') {
      return NextResponse.json(
        { error: 'Access denied: only users can place orders' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { items, totalPrice } = body;

    if (!items || !Array.isArray(items) || items.length === 0)
      return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 });

    if (!totalPrice || typeof totalPrice !== 'number')
      return NextResponse.json({ error: 'Invalid total price' }, { status: 400 });

    // ✅ Fetch menu names for all items
    const itemDetails = await Promise.all(
    (items as OrderItemInput[]).map(async (item) => {
      const menu = await Menu.findById(item.menuId).select("name");
      if (!menu) throw new Error(`Menu not found: ${item.menuId}`);

      return {
        menuId: item.menuId,
        menuName: menu.name,
        quantity: item.quantity ?? 1,
        instructions: item.instructions ?? "",
        addons: item.addons ?? [],
      };
    })
  );


    // ✅ Create order with embedded menu names
    const newOrder = await Order.create({
      user: decoded.id,
      items: itemDetails,
      totalPrice,
      status: 'pending',
    });

    // ✅ Create user notification
    await Notification.create({
      user: decoded.id,
      title: 'Order Placed Successfully',
      message: 'Your order has been placed and is pending approval.',
      type: 'order',
    });

    // ✅ Notify all admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        title: 'New Order Received',
        message: `A new order has been placed by ${decoded.email}.`,
        type: 'order',
      });
    }

    return NextResponse.json(
      { message: 'Order placed successfully', order: newOrder },
      { status: 201 }
    );
  } catch (err) {
    console.log(err)
    return NextResponse.json(
      { error: 'Server error while placing order' },
      { status: 500 }
    );
  }
}
