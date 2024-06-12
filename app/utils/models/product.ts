import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  productId: string;
  name: string;
  description: string;
  price: number;
}

const ProductSchema: Schema = new Schema({
  productId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
});

export default mongoose.model<IProduct>("Product", ProductSchema);
