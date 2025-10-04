import mongoose, { Schema, Document, Model } from 'mongoose';

export type Role = 'customer' | 'admin';

export interface IUser extends Document {
    _id:string;
  name: string;
  email: string;
  password: string;
  role: Role;
  address?: string;         
  contactNumber?: string;    
  preferences?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  address: { type: String },
  contactNumber: { type: String },
  preferences: { type: String },
}, { timestamps: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
