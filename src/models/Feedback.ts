import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFeedback extends Document {
  user: mongoose.Schema.Types.ObjectId;
  menu: mongoose.Schema.Types.ObjectId;
  order: mongoose.Schema.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    menu: { type: Schema.Types.ObjectId, ref: 'Menu', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

const Feedback: Model<IFeedback> =
  mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);
export default Feedback;
