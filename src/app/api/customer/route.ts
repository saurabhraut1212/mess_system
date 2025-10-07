import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { verifyToken } from "@/lib/auth";

// ---------------------------
// 🔹 Type Definitions
// ---------------------------
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
  menuId: PopulatedMenu | null; // populated field or null if missing
  quantity: number;
}

interface OrderDoc {
  _id: string;
  totalPrice: number;
  rating?: number;
  status?: string;
  createdAt: string;
  items: OrderItem[];
}

// ---------------------------
// 🔹 API Handler
// ---------------------------
export async function GET(req: NextRequest) {
  await connectDB();

  const authHeader = req.headers.get("Authorization");
  if (!authHeader)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as DecodedToken;

    // ✅ Fetch user's orders (with populated menu names)
    const orders = (await Order.find({ user: decoded.id })
      .populate("items.menuId", "name")
      .sort({ createdAt: -1 })
      .lean()) as unknown as OrderDoc[];

    // ✅ Basic summaries
    const totalOrders = orders.length;
    const totalSpent = orders.reduce(
      (sum, order) => sum + (order.totalPrice || 0),
      0
    );

    const avgRating =
      orders.length > 0
        ? orders.reduce((sum, o) => sum + (o.rating || 0), 0) / orders.length
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
