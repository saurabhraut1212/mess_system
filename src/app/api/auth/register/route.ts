import { NextRequest, NextResponse } from 'next/server';
import {connectDB} from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { createDelivery, initAdmin } from '@/utils/initAdmin';

export async function POST(req: NextRequest) {
  await connectDB();
  await initAdmin(); // ensure initial admin exists
  await createDelivery(); // ensure delivery user exists

  const { name, email, password } = await req.json(); 

  const existingUser = await User.findOne({ email });
  if (existingUser) return NextResponse.json({ error: 'User already exists' }, { status: 400 });

  const hashedPassword = await hashPassword(password);

  const user = await User.create({ name, email, password: hashedPassword, role: 'customer' }); 

  return NextResponse.json({ message: 'User registered successfully', userId: user._id });
}
