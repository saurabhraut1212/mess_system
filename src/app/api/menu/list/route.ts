import {  NextResponse } from 'next/server';
import {connectDB} from '@/lib/db';
import Menu from '@/models/Menu';

export async function GET() {
  await connectDB();
  const menus = await Menu.find().sort({ date: 1 });
  return NextResponse.json(menus);
}
