import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URL;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in your .env file');
}

export async function connectDB() {
  try {
    const conn = await mongoose.connect(MONGODB_URI!);
    console.log('MongoDB connected:', conn.connection.host);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}
