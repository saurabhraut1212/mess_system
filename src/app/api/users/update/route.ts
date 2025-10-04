import { NextRequest, NextResponse } from 'next/server';
import {connectDB} from '@/lib/db';
import User from '@/models/User';
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
    const decoded = verifyToken(token) as DecodedToken ;

    const { name, address, contactNumber, preferences } = await req.json();

    const user = await User.findById(decoded.id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Update fields generically
    if (name) user.name = name;
    if (address) user.address = address;
    if (contactNumber) user.contactNumber = contactNumber;
    if (preferences) user.preferences = preferences;

    await user.save();

    return NextResponse.json({ message: 'Profile updated successfully', user });
  } catch (err:unknown) {
    console.log(err)
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
