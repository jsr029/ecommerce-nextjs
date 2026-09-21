import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  endDate?: Date;
  location: string;
  city: string;
  image: string;
  ticketPrice: number;
  ticketUrl?: string;
  category: "concert" | "festival" | "meetup" | "workshop" | "other";
  featured: boolean;
  capacity?: number;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    endDate: { type: Date },
    location: { type: String, required: true },
    city: { type: String, required: true },
    image: { type: String, required: true },
    ticketPrice: { type: Number, default: 0 },
    ticketUrl: { type: String },
    category: {
      type: String,
      enum: ["concert", "festival", "meetup", "workshop", "other"],
      default: "concert",
    },
    featured: { type: Boolean, default: false },
    capacity: { type: Number },
  },
  { timestamps: true }
);

const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

export default Event;
