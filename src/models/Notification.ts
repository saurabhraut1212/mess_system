import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
    _id:string;
  user: mongoose.Schema.Types.ObjectId;
  title: string;
  message: string;
  type: 'order' | 'feedback' | 'system' | 'delivery';
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['order', 'feedback', 'system', 'delivery'],
      default: 'system',
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export default Notification;
