import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';
import Order from '@/models/Order';
import Feedback from '@/models/Feedback';
import Menu from '@/models/Menu';

interface DecodedToken {
  id: string;
  role: string;
}

interface MenuLean {
  _id: mongoose.Types.ObjectId;
  name: string;
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
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    // --- Revenue Stats ---
    const totalOrders = await Order.countDocuments();
    const orders = await Order.find();
    const totalRevenue = orders
    .filter((order) => order.status === "delivered" || order.status === "assigned" || order.status === "accepted")
    .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // --- Orders by Status ---
    const orderStatusCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // --- Top Rated Meals ---
    const topMeals = await Feedback.aggregate([
      {
        $group: {
          _id: '$menu',
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
      { $sort: { avgRating: -1 } },
      { $limit: 5 },
    ]);

    // Extract meal IDs and ensure correct typing
    const mealIds = topMeals.map((m) => new mongoose.Types.ObjectId(m._id));

    // Fetch corresponding meal names
   const menus = await Menu.find({ _id: { $in: mealIds } }, 'name').lean<MenuLean[]>();

const topMealsWithNames = topMeals.map((m) => {
  const menu = menus.find(
    (menu) => menu._id.toString() === (m._id as mongoose.Types.ObjectId).toString()
  );
  return {
    name: menu?.name || 'Unknown',
    avgRating: Number(m.avgRating.toFixed(1)),
    totalReviews: m.totalReviews,
  };
});

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      orderStatusCounts,
      topMealsWithNames,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
