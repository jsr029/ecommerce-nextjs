import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { requireUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = requireUser(request);
  if (!auth) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    await dbConnect();
    const user = await User.findById(auth.userId).select("-password").lean();
    if (!user) {
      return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    }

    // Auto-expire check
    const u = user as {
      subscriptionStatus?: string;
      subscriptionExpiresAt?: Date;
    };
    if (
      u.subscriptionStatus === "active" &&
      u.subscriptionExpiresAt &&
      new Date(u.subscriptionExpiresAt) < new Date()
    ) {
      await User.findByIdAndUpdate(auth.userId, {
        subscriptionStatus: "expired",
      });
      (user as { subscriptionStatus: string }).subscriptionStatus = "expired";
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
