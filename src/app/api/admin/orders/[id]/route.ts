import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/auth";

/**
 * Cancellation rules (admin):
 * - pending / paid (digital not yet "consumed"): allowed
 * - processing: allowed with reason
 * - shipped: allowed only within 24h of ship with reason (simplified: allowed with reason)
 * - delivered: NOT allowed (except exceptional admin override with reason)
 * - cancelled: already cancelled
 * On cancel of physical items: restock
 */

const CANCELLABLE = new Set(["pending", "paid", "processing", "shipped"]);

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
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    // Status update (including cancel)
    if (body.status) {
      if (body.status === "cancelled") {
        if (order.status === "cancelled") {
          return NextResponse.json({ error: "Déjà annulée" }, { status: 400 });
        }
        if (order.status === "delivered" && !body.force) {
          return NextResponse.json(
            {
              error:
                "Une commande livrée ne peut pas être annulée (sauf cas exceptionnel avec force=true et motif).",
            },
            { status: 400 }
          );
        }
        if (!CANCELLABLE.has(order.status) && order.status !== "delivered") {
          return NextResponse.json(
            { error: `Annulation impossible depuis le statut « ${order.status} »` },
            { status: 400 }
          );
        }
        if (!body.cancelReason || String(body.cancelReason).trim().length < 5) {
          return NextResponse.json(
            { error: "Un motif d'annulation d'au moins 5 caractères est requis" },
            { status: 400 }
          );
        }

        // Restock physical products
        for (const item of order.items) {
          if (item.productType === "physical" || !item.productType) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: item.quantity },
            });
          }
        }

        order.status = "cancelled";
        order.cancelReason = body.cancelReason.trim();
        order.cancelledAt = new Date();
        order.cancelledBy = "admin";
        await order.save();
        return NextResponse.json(order);
      }

      // Other status transitions
      const allowed: Record<string, string[]> = {
        pending: ["paid", "processing", "cancelled"],
        paid: ["processing", "shipped", "delivered", "cancelled"],
        processing: ["shipped", "delivered", "cancelled"],
        shipped: ["delivered", "cancelled"],
        delivered: [],
        cancelled: [],
      };
      const next = body.status as string;
      if (!allowed[order.status]?.includes(next) && next !== order.status) {
        return NextResponse.json(
          {
            error: `Transition interdite : ${order.status} → ${next}`,
          },
          { status: 400 }
        );
      }
      order.status = next as typeof order.status;
    }

    if (body.paymentMethod) order.paymentMethod = body.paymentMethod;
    if (body.paypalOrderId) order.paypalOrderId = body.paypalOrderId;

    await order.save();
    return NextResponse.json(order);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
