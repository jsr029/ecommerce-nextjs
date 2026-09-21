import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Admin requis" }, { status: 403 });
  }
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const query: Record<string, unknown> = {};
    if (status && status !== "all") query.status = status;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .lean();
    return NextResponse.json(orders);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
