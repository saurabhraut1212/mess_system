import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMenuItem {
  name: string;
  quantity?: string;
}

export interface IMenu extends Document {
  name: string;
  description?: string;
  price: number;
  category?: string;
  dietaryInfo?: string;
  date: Date;
  isMeal: boolean;
  items?: IMenuItem[];
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    name: { type: String, required: true },
    quantity: { type: String },
  },
  { _id: false }
);

const menuSchema = new Schema<IMenu>(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String },
    dietaryInfo: { type: String },
    date: { type: Date, required: true },
    isMeal: { type: Boolean, default: false },
    items: { type: [menuItemSchema], default: [] },
  },
  { timestamps: true }
);

// 🚀 FORCE REMOVE OLD MODEL (Next.js safe way)
if (mongoose.models.Menu) {
  delete mongoose.models.Menu;
}

const Menu: Model<IMenu> = mongoose.model<IMenu>('Menu', menuSchema);
export default Menu;
