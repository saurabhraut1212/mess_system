import { NextRequest, NextResponse } from 'next/server';
import {connectDB} from '@/lib/db';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/auth';

interface DecodedToken {
    id: string;
    email: string;
    role: string;
}
export async function GET(req: NextRequest) {
  await connectDB();
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
   const token = authHeader.split(' ')[1];
   const decoded = verifyToken(token) as DecodedToken;

   console.log(decoded,"decoded");

    const orders = await Order.find({user:decoded.id}).populate('items.menuId').sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
