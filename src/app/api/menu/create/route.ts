import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Menu from '@/models/Menu';
import { verifyToken } from '@/lib/auth';

interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

export async function POST(req: NextRequest) {
  await connectDB();
  const authHeader = req.headers.get('Authorization');
  if (!authHeader)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token) as DecodedToken;
    if (decoded.role !== 'admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { name, description, price, category, dietaryInfo, date, isMeal, items } = body;
    console.log(body,"body");
    
console.log("Model Paths:", Object.keys(Menu.schema.paths));

    const menuData = {
      name,
      description,
      price,
      category,
      dietaryInfo,
      date,
      isMeal: !!isMeal,
      items: isMeal && Array.isArray(items) ? items : [],
    };
    console.log(menuData,"menuData");

    const menuItem = await Menu.create(menuData);

    return NextResponse.json({
      message: 'Menu / Meal created successfully',
      menuItem,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
