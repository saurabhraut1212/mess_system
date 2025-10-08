import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import Menu from '@/models/Menu';
import User from '@/models/User';
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
    if (decoded.role !== 'admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // --- Fetch counts ---
    const totalMenus = await Menu.countDocuments();
    const totalUsers = await User.countDocuments();

    // Orders & revenue
    const orders = await Order.find().lean();
    const totalOrders = orders.length;
    // ✅ Include only delivered orders in totalRevenue
    const totalRevenue = orders
    .filter((ord) => ord.status === 'delivered')
    .reduce((sum, ord) => sum + (ord.totalPrice || 0), 0);


    // Recent activity (last 5 orders/menus/users)
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).lean();
    const recentMenus = await Menu.find().sort({ createdAt: -1 }).limit(5).lean();
    // const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).lean();

    const recentItems: { name: string; type: string; date: string }[] = [];

    recentMenus.forEach(m => {
      recentItems.push({
        name: m.name,
        type: 'Menu',
        date: m.createdAt.toISOString().split('T')[0],
      });
    });
    recentOrders.forEach(o => {
      recentItems.push({
        name: `Order #${o._id.toString().slice(-5)}`,
        type: 'Order',
        date: o.createdAt.toISOString().split('T')[0],
      });
    });
    // recentUsers.forEach(u => {
    //   recentItems.push({
    //     name: u.name,
    //     type: 'User',
    //     date: u.createdAt.toISOString().split('T')[0],
    //   });
    //});

    // Optionally sort recentItems by date desc
    recentItems.sort((a, b) => (a.date < b.date ? 1 : -1));

    return NextResponse.json({
      totalMenus,
      totalUsers,
      totalOrders,
      totalRevenue,
      recentItems,
    });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
