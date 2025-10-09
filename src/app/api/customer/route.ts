import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Feedback from "@/models/Feedback";
import { verifyToken } from "@/lib/auth";

interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

interface PopulatedMenu {
  _id: string;
  name: string;
}

interface OrderItem {
  menuId: PopulatedMenu | null;
  quantity: number;
}

interface OrderDoc {
  _id: string;
  totalPrice: number;
  status?: string;
  createdAt: string;
  items: OrderItem[];
}

export async function GET(req: NextRequest) {
  await connectDB();

  const authHeader = req.headers.get("Authorization");
  if (!authHeader)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as DecodedToken;

    // ✅ Fetch user's orders
    const orders = (await Order.find({ user: decoded.id })
      .populate("items.menuId", "name")
      .sort({ createdAt: -1 })
      .lean()) as unknown as OrderDoc[];

    // ✅ Fetch user's feedbacks
    const feedbacks = await Feedback.find({ user: decoded.id }).lean();

    // ✅ Basic summaries
    const totalOrders = orders.length;

    // ✅ Exclude cancelled orders from spending
  // ✅ Include only delivered orders in totalSpent
    const totalSpent = orders
    .filter((order) => order.status === "delivered" || order.status === "assigned" || order.status === "accepted")
    .reduce((sum, order) => sum + (order.totalPrice || 0), 0);


    // ✅ Calculate avg rating from feedbacks
    const avgRating =
      feedbacks.length > 0
        ? feedbacks.reduce((sum, fb) => sum + fb.rating, 0) /
          feedbacks.length
        : 0;

    // ✅ Favorite Meal Calculation
    const mealCount: Record<string, number> = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const name = item.menuId?.name ?? "Unknown";
        mealCount[name] = (mealCount[name] || 0) + (item.quantity || 1);
      });
    });

    const favoriteMeal =
      Object.keys(mealCount).sort((a, b) => mealCount[b] - mealCount[a])[0] ||
      "N/A";

    // ✅ Prepare recent orders summary
    const recentOrders = orders.slice(0, 5).map((order) => {
      const firstItem = order.items[0];
      const menuName =
        order.items.length > 1
          ? `${firstItem?.menuId?.name || "Unknown"} +${
              order.items.length - 1
            } more`
          : firstItem?.menuId?.name || "Unknown";

      return {
        _id: order._id.toString(),
        menuName,
        price: order.totalPrice || 0,
        date: order.createdAt,
        status: order.status || "N/A",
      };
    });

    // ✅ Response
    return NextResponse.json({
      summary: {
        totalOrders,
        totalSpent,
        avgRating: Number(avgRating.toFixed(1)),
        favoriteMeal,
      },
      recentOrders,
    });
  } catch (err) {
    console.error("Customer dashboard error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
