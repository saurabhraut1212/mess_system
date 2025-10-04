import { NextRequest, NextResponse } from 'next/server';
import {connectDB} from '@/lib/db';
import Menu from '@/models/Menu';
import { verifyToken } from '@/lib/auth';

interface DecodedToken {
    id: string;
    email: string;
    role: string;
}

export async function PATCH(req: NextRequest) {
  await connectDB();
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token) as DecodedToken;
    if (decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id, ...updates } = await req.json();
    const menuItem = await Menu.findByIdAndUpdate(id, updates, { new: true });
    if (!menuItem) return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });

    return NextResponse.json({ message: 'Menu updated', menuItem });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
