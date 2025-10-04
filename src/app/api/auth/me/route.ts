import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import {connectDB} from '@/lib/db';
import User from '@/models/User';

interface DecodedToken {
    id: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

export async function GET(req: NextRequest) {
  await connectDB();
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token) as DecodedToken;
    const user = await User.findById(decoded.id).select('-password');
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid token',err }, { status: 401 });
  }
}
