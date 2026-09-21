import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import LiveStream from "@/models/LiveStream";
import { requireAdmin } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Admin requis" }, { status: 403 });
  }
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    if (body.isLive === true) {
      await LiveStream.updateMany(
        { _id: { $ne: id }, isLive: true },
        { isLive: false }
      );
      body.startedAt = new Date();
    }

    const stream = await LiveStream.findByIdAndUpdate(id, body, { new: true });
    if (!stream) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    return NextResponse.json(stream);
  } catch {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Admin requis" }, { status: 403 });
  }
  try {
    await dbConnect();
    const { id } = await params;
    await LiveStream.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
