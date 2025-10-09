import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { verifyToken } from "@/lib/auth";

interface DecodedToken {
  id: string;
}

export async function DELETE(req: NextRequest) {
  await connectDB();

  const authHeader = req.headers.get("Authorization");
  if (!authHeader)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as DecodedToken;

    // ✅ Delete all notifications of the logged-in user
    await Notification.deleteMany({ user: decoded.id });

    return NextResponse.json({ message: "All notifications cleared successfully" });
  } catch (err) {
    console.error("Clear notifications error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
