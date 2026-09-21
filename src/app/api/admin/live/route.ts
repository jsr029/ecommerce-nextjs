import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import LiveStream from "@/models/LiveStream";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Admin requis" }, { status: 403 });
  }
  try {
    await dbConnect();
    const streams = await LiveStream.find().sort({ updatedAt: -1 }).lean();
    return NextResponse.json(streams);
  } catch {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Admin requis" }, { status: 403 });
  }
  try {
    await dbConnect();
    const body = await request.json();
    if (body.isLive) {
      // Only one live at a time optional – stop others
      await LiveStream.updateMany({ isLive: true }, { isLive: false });
      body.startedAt = new Date();
    }
    const stream = await LiveStream.create(body);
    return NextResponse.json(stream, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur création" }, { status: 500 });
  }
}
