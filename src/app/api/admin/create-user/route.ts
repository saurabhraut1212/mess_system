import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyToken, hashPassword } from "@/lib/auth";
import User from "@/models/User";

interface DecodedToken {
  id: string;
  role: string;
}

export async function POST(req: NextRequest) {
  await connectDB();

  const authHeader = req.headers.get("Authorization");
  if (!authHeader)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token) as DecodedToken;

  // ✅ Only admins can access this
  if (decoded.role !== "admin")
    return NextResponse.json({ error: "Access denied" }, { status: 403 });

  const { name, email, password, role } = await req.json();

  if (!name || !email || !password || !role)
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });

  // ✅ Allow only 'admin' or 'delivery' creation
  if (!["admin", "delivery"].includes(role))
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });

  const existing = await User.findOne({ email });
  if (existing)
    return NextResponse.json({ error: "User already exists" }, { status: 400 });

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  return NextResponse.json({
    message: `${role} user created successfully`,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}
