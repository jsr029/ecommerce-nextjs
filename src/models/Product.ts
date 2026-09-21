import mongoose, { Schema, Document, Model } from "mongoose";

export type ProductType = "physical" | "music" | "video" | "photo" | "digital";

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  featured: boolean;
  productType: ProductType;
  // Digital / media fields
  mediaUrl?: string;        // full file URL (download after purchase)
  previewUrl?: string;      // short preview (music/video)
  previewDuration?: number; // seconds for free preview
  duration?: number;        // full duration in seconds
  fileSize?: string;        // e.g. "12.4 MB"
  format?: string;          // mp3, mp4, jpg zip...
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    featured: { type: Boolean, default: false },
    productType: {
      type: String,
      enum: ["physical", "music", "video", "photo", "digital"],
      default: "physical",
    },
    mediaUrl: { type: String },
    previewUrl: { type: String },
    previewDuration: { type: Number, default: 30 },
    duration: { type: Number },
    fileSize: { type: String },
    format: { type: String },
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
