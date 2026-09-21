import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import LiveStream from "@/models/LiveStream";

export async function GET() {
  try {
    await dbConnect();
    // Prefer currently live stream(s), else all
    const live = await LiveStream.find({ isLive: true }).sort({ startedAt: -1 }).lean();
    if (live.length > 0) {
      return NextResponse.json(live);
    }
    const all = await LiveStream.find().sort({ updatedAt: -1 }).limit(10).lean();
    return NextResponse.json(all);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
