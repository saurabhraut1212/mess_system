import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Menu from '@/models/Menu';
import Feedback from '@/models/Feedback';

export async function GET() {
  await connectDB();

  try {
    const menus = await Menu.find().sort({ date: 1 }).lean();

    // Optional: Aggregate ratings (if feedback model exists)
    const ratings = await Feedback.aggregate([
      {
        $group: {
          _id: '$menu',
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

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
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
