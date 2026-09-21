import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SubscriptionPlan from "@/models/SubscriptionPlan";

export async function GET() {
  try {
    await dbConnect();
    const plans = await SubscriptionPlan.find({ active: true }).lean();
    return NextResponse.json(plans);
  } catch {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
