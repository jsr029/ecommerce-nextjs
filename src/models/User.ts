import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  image?: string;
  authProvider: "local" | "google";
  role: "user" | "admin";
  subscriptionPlan?: "none" | "monthly" | "yearly";
  subscriptionStatus?: "active" | "expired" | "cancelled" | "none";
  subscriptionExpiresAt?: Date;
  subscriptionStartedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: false },
    googleId: { type: String, sparse: true },
    image: { type: String },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    subscriptionPlan: {
      type: String,
      enum: ["none", "monthly", "yearly"],
      default: "none",
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "expired", "cancelled", "none"],
      default: "none",
    },
    subscriptionExpiresAt: { type: Date },
    subscriptionStartedAt: { type: Date },
  },
  { timestamps: true }
);

UserSchema.methods.hasActiveSubscription = function (): boolean {
  if (this.subscriptionStatus !== "active") return false;
  if (!this.subscriptionExpiresAt) return false;
  return new Date(this.subscriptionExpiresAt) > new Date();
};

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
