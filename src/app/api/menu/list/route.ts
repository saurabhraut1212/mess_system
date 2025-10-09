import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Menu from '@/models/Menu';
import Feedback from '@/models/Feedback';

export async function GET() {
  await connectDB();

  try {
    // ✅ Get current date (00:00 to 23:59)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // ✅ Fetch only today's menus
    const menus = await Menu.find({
      date: { $gte: today, $lt: tomorrow },
    })
      .sort({ date: 1 })
      .lean();

    // ✅ Aggregate ratings from Feedback
    const ratings = await Feedback.aggregate([
      {
        $group: {
          _id: '$menu',
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    // ✅ Map ratings to menu
    const ratingMap = new Map(
      ratings.map((r) => [
        r._id.toString(),
        { avgRating: r.avgRating, totalReviews: r.totalReviews },
      ])
    );

    const menusWithRatings = menus.map((menu) => ({
      ...menu,
      avgRating: ratingMap.get(menu._id.toString())?.avgRating || 0,
      totalReviews: ratingMap.get(menu._id.toString())?.totalReviews || 0,
    }));

    return NextResponse.json(menusWithRatings);
  } catch (err) {
    console.error('Error fetching today’s menus:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
