import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import { requireUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const auth = requireUser(request);
  if (!auth) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    await dbConnect();
    const { planSlug, paypalOrderId } = await request.json();
    if (!planSlug || !["monthly", "yearly"].includes(planSlug)) {
      return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
    }

    const plan = await SubscriptionPlan.findOne({ slug: planSlug, active: true });
    if (!plan) {
      return NextResponse.json({ error: "Plan introuvable" }, { status: 404 });
    }

    const user = await User.findById(auth.userId);
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const now = new Date();
    // Extend if already active
    let start = now;
    if (
      user.subscriptionStatus === "active" &&
      user.subscriptionExpiresAt &&
      new Date(user.subscriptionExpiresAt) > now
    ) {
      start = new Date(user.subscriptionExpiresAt);
    }

    const expires = new Date(start);
    expires.setDate(expires.getDate() + plan.durationDays);

    user.subscriptionPlan = plan.slug;
    user.subscriptionStatus = "active";
    user.subscriptionStartedAt = user.subscriptionStartedAt || now;
    user.subscriptionExpiresAt = expires;
    await user.save();

    return NextResponse.json({
      ok: true,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
      paypalOrderId,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur abonnement" }, { status: 500 });
  }
}
