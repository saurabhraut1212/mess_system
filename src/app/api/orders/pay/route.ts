// import { NextRequest, NextResponse } from 'next/server';
// import {connectDB} from '@/lib/db';
// import Order from '@/models/Order';
// import { verifyToken } from '@/lib/auth';

// interface DecodedToken {
//     id: string;
//     email: string;
//     role: string;
// }

// export async function POST(req: NextRequest) {
//   await connectDB();
//   const authHeader = req.headers.get('Authorization');
//   if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

//   try {
//     const token = authHeader.split(' ')[1];
//     const decoded = verifyToken(token) as DecodedToken;

//     const { orderId, paymentMethod } = await req.json();
//     const order = await Order.findById(orderId);
//     if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
//     if (order.user.toString() !== decoded.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

//     // Mock payment process
//     // In future, integrate Razorpay, Stripe, etc.
//     console.log(`Payment received via ${paymentMethod} for order ${orderId}`);

//     // Update order status to 'preparing' after successful payment
//     order.status = 'preparing';
//     await order.save();

//     return NextResponse.json({ message: 'Payment successful, order is now preparing', order });
//   } catch (err) {
//     console.log(err);
//     return NextResponse.json({ error: 'Server error' }, { status: 500 });
//   }
// }
