import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { requireUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string; productId: string }> }
) {
  try {
    const auth = requireUser(request);
    if (!auth) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await dbConnect();
    const { orderId, productId } = await params;

    // Special case: subscription download (orderId === "sub")
    if (orderId === "sub") {
      const user = await User.findById(auth.userId);
      if (!user) {
        return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
      }
      const active =
        user.subscriptionStatus === "active" &&
        user.subscriptionExpiresAt &&
        new Date(user.subscriptionExpiresAt) > new Date();
      if (!active) {
        return NextResponse.json(
          { error: "Abonnement requis pour télécharger. Achetez le morceau ou souscrivez." },
          { status: 403 }
        );
      }
      const product = await Product.findById(productId);
      if (!product || product.productType !== "music" || !product.mediaUrl) {
        return NextResponse.json({ error: "Fichier indisponible" }, { status: 404 });
      }
      return NextResponse.json({
        downloadUrl: product.mediaUrl,
        name: product.name,
        format: product.format,
        fileSize: product.fileSize,
        via: "subscription",
      });
    }

    const order = await Order.findById(orderId);
    if (!order || order.user.toString() !== auth.userId) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }
    if (order.status !== "paid" && order.status !== "delivered") {
      return NextResponse.json({ error: "Commande non payée" }, { status: 403 });
    }

    const item = order.items.find((i) => i.product.toString() === productId);
    if (!item) {
      return NextResponse.json({ error: "Produit non dans la commande" }, { status: 404 });
    }

    const product = await Product.findById(productId);
    if (!product || !product.mediaUrl) {
      return NextResponse.json({ error: "Fichier indisponible" }, { status: 404 });
    }

    return NextResponse.json({
      downloadUrl: product.mediaUrl,
      name: product.name,
      format: product.format,
      fileSize: product.fileSize,
      via: "purchase",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
