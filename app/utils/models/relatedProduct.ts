import mongoose, { Schema, Document } from "mongoose";

export interface IRelatedProduct extends Document {
  productId: string;
  relatedProductId: string;
  position: number;
}

const RelatedProductSchema: Schema = new Schema({
  productId: { type: String, required: true },
  relatedProductId: { type: String, required: true },
  position: { type: Number, required: true },
});

export default mongoose.model<IRelatedProduct>(
  "RelatedProduct",
  RelatedProductSchema,
);
