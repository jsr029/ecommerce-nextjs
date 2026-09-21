import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILiveStream extends Document {
  title: string;
  description: string;
  streamUrl: string;       // Icecast / Shoutcast / HLS / direct MP3 stream
  coverImage: string;
  isLive: boolean;
  djName?: string;
  genre?: string;
  listeners?: number;
  startedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LiveStreamSchema = new Schema<ILiveStream>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    streamUrl: { type: String, required: true },
    coverImage: { type: String, required: true },
    isLive: { type: Boolean, default: false },
    djName: { type: String },
    genre: { type: String },
    listeners: { type: Number, default: 0 },
    startedAt: { type: Date },
  },
  { timestamps: true }
);

const LiveStream: Model<ILiveStream> =
  mongoose.models.LiveStream ||
  mongoose.model<ILiveStream>("LiveStream", LiveStreamSchema);

export default LiveStream;
