import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
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
    const update: Record<string, unknown> = {};
    if (body.name) update.name = body.name;
    if (body.email) update.email = body.email;
    if (body.role) update.role = body.role;
    if (body.password) update.password = await bcrypt.hash(body.password, 10);
    if (body.subscriptionPlan !== undefined) update.subscriptionPlan = body.subscriptionPlan;
    if (body.subscriptionStatus !== undefined) update.subscriptionStatus = body.subscriptionStatus;
    if (body.subscriptionExpiresAt !== undefined) {
      update.subscriptionExpiresAt = body.subscriptionExpiresAt
        ? new Date(body.subscriptionExpiresAt)
        : null;
    }

    const user = await User.findByIdAndUpdate(id, update, { new: true }).select("-password");
    if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    return NextResponse.json(user);
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
    const admin = requireAdmin(request)!;
    if (admin.userId === id) {
      return NextResponse.json({ error: "Impossible de supprimer votre propre compte" }, { status: 400 });
    }
    await User.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
