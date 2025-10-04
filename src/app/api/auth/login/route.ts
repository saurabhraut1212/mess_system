import { NextRequest, NextResponse } from 'next/server';
import {connectDB} from '@/lib/db';
import User from '@/models/User';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  await connectDB();
  const { email, password } = await req.json();

  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const isValid = await comparePassword(password, user.password);
  if (!isValid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const token = generateToken(user);
  return NextResponse.json({ message:"User logged in successfully",token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}
