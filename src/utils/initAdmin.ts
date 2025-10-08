import { connectDB } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function initAdmin() {
  await connectDB();

  const adminEmail = process.env.INIT_ADMIN_EMAIL;
  const adminPassword = process.env.INIT_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) return;

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await User.create({
      name: 'Super Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    });
    console.log('Initial admin created');
  }
}

export async function createDelivery() {
  await connectDB();

  const existingDelivery = await User.findOne({ email: 'delivery@gmail.com' });
  if (!existingDelivery) {
  const hashedPassword = await bcrypt.hash('delivery123', 10);

    await User.create({
    name: 'Test Delivery Boy',
    email: 'delivery@gmail.com',
    password: hashedPassword,
    role: 'delivery',
  });
  }
  console.log('✅ Delivery user created:');
}


