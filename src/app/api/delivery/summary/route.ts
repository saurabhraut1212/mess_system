import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { verifyToken } from "@/lib/auth";
import  { Types } from "mongoose";

interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

interface PopulatedMenu {
  _id: Types.ObjectId;
  name: string;
}

interface OrderItem {
  menuId: Types.ObjectId | PopulatedMenu;
  quantity: number;
}

interface OrderDoc {
  _id: Types.ObjectId;
  items: OrderItem[];
  totalPrice: number;
  status: string;
  rating?: number;
  createdAt: Date;
}

// ✅ Type guard
function isPopulatedMenu(
  menuId: Types.ObjectId | PopulatedMenu
): menuId is PopulatedMenu {
  return (menuId as PopulatedMenu).name !== undefined;
}

export async function GET(req: NextRequest) {
  await connectDB();
  const authHeader = req.headers.get("Authorization");
  if (!authHeader)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as DecodedToken;
   

    const orders = (await Order.find({assignedTo: decoded.id })
      .populate("items.menuId", "name")
      .sort({ createdAt: -1 })
      .lean()) as unknown as OrderDoc[];

    const totalOrders = orders.length;
    const totalSpent = orders.reduce(
      (sum, o) => sum + (o.totalPrice || 0),
      0
    );
   
    const mealCount: Record<string, number> = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const name = isPopulatedMenu(item.menuId)
          ? item.menuId.name
          : "Unknown";
        mealCount[name] = (mealCount[name] || 0) + (item.quantity || 1);
      });
    });

    const favoriteMeal =
      Object.keys(mealCount).sort((a, b) => mealCount[b] - mealCount[a])[0] ||
      "N/A";

    const recentOrders = orders.slice(0, 5).map((o) => {
      const firstItem = o.items[0];
      const menuName =
        o.items.length > 1
          ? `${isPopulatedMenu(firstItem.menuId) ? firstItem.menuId.name : "Unknown"} +${o.items.length - 1} more`
          : isPopulatedMenu(firstItem.menuId)
          ? firstItem.menuId.name
          : "Unknown";

      return {
        _id: o._id.toString(),
        menuName,
        price: o.totalPrice || 0,
        date: o.createdAt,
        status: o.status || "N/A",
      };
    });

    return NextResponse.json({
      summary: {
        totalOrders,
        totalSpent,
        favoriteMeal,
      },
      recentOrders,
    });
  } catch (err) {
    console.error("Customer dashboard error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
