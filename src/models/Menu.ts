import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMenu extends Document {
  name: string;
  description?: string;
  price: number;
  category?: string;
  dietaryInfo?: string; 
  date: Date; 
  createdAt: Date;
  updatedAt: Date;
}

const menuSchema = new Schema<IMenu>({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String },
  dietaryInfo: { type: String },
  date: { type: Date, required: true },
}, { timestamps: true });

const Menu: Model<IMenu> = mongoose.models.Menu || mongoose.model('Menu', menuSchema);
export default Menu;
