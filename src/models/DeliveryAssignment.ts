import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDeliveryAssignment extends Document {
  order: mongoose.Schema.Types.ObjectId;
  deliveryBoy: mongoose.Schema.Types.ObjectId;
  status: 'assigned' | 'picked-up' | 'delivered';
  createdAt: Date;
}

const deliverySchema = new Schema<IDeliveryAssignment>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    deliveryBoy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['assigned', 'picked-up', 'delivered'], default: 'assigned' },
  },
  { timestamps: true }
);

const DeliveryAssignment: Model<IDeliveryAssignment> =
  mongoose.models.DeliveryAssignment ||
  mongoose.model('DeliveryAssignment', deliverySchema);

export default DeliveryAssignment;
