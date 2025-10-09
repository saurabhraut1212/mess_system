import mongoose, { Schema, Document, Model } from 'mongoose';

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'assigned'
  | 'picked-up'
  | 'delivered'
  | 'cancelled'
  | 'rejected';

export interface IOrder extends Document {
  user: mongoose.Schema.Types.ObjectId;
  assignedTo?: mongoose.Schema.Types.ObjectId; // Delivery boy
  items: {
    menuId: mongoose.Schema.Types.ObjectId;
    menuName: string;
    quantity: number;
    instructions?: string;
    addons?: string[];
  }[];
  status: OrderStatus;
  totalPrice: number;
  rating?: number;
  cancelledBy?: 'customer' | 'admin';
  statusUpdatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' }, // delivery person
    items: [
      {
        menuId: { type: Schema.Types.ObjectId, ref: 'Menu', required: true },
        menuName: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        instructions: { type: String },
        addons: { type: [String] },
      },
    ],
    status: {
      type: String,
      enum: [
        'pending',
        'accepted',
        'assigned',
        'picked-up',
        'delivered',
        'cancelled',
        'rejected',
      ],
      default: 'pending',
    },
    totalPrice: { type: Number, required: true },
    rating: { type: Number },
    cancelledBy: { type: String, enum: ['customer', 'admin'] },
    statusUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// auto update timestamp when status changes
orderSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusUpdatedAt = new Date();
  }
  next();
});

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);

export default Order;
