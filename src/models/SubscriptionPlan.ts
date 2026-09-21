import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubscriptionPlan extends Document {
  name: string;
  slug: "monthly" | "yearly";
  description: string;
  price: number;
  durationDays: number;
  features: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: { type: String, required: true },
    slug: { type: String, enum: ["monthly", "yearly"], required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    durationDays: { type: Number, required: true },
    features: [{ type: String }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const SubscriptionPlan: Model<ISubscriptionPlan> =
  mongoose.models.SubscriptionPlan ||
  mongoose.model<ISubscriptionPlan>("SubscriptionPlan", SubscriptionPlanSchema);

export default SubscriptionPlan;
