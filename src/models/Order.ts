import mongoose, { Schema, Document, Model } from 'mongoose';

export type OrderStatus = 
  | 'pending' 
  | 'preparing' 
  | 'out-for-delivery' 
  | 'delivered' 
  | 'cancelled';

export interface IOrder extends Document {
  user: mongoose.Schema.Types.ObjectId;
  items: {
    menuId: mongoose.Schema.Types.ObjectId;
    menuName: string; // ✅ Added field
    quantity: number;
    instructions?: string;
    addons?: string[];
  }[];
  status: OrderStatus;
  totalPrice: number;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        menuId: { type: Schema.Types.ObjectId, ref: 'Menu', required: true },
        menuName: { type: String, required: true }, // ✅ new field
        quantity: { type: Number, default: 1 },
        instructions: { type: String },
        addons: { type: [String] },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    totalPrice: { type: Number, required: true },
    rating: { type: Number },
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
