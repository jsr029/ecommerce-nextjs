import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-change-me";

function getUser(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(auth.slice(7), JWT_SECRET) as {
      userId: string;
      role: string;
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getUser(request);
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    await dbConnect();
    const query = user.role === "admin" ? {} : { user: user.userId };
    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json(orders);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUser(request);
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { items, shippingAddress, paymentMethod, paypalOrderId, status } = body;

    if (!items?.length || !shippingAddress) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json({ error: "Produit introuvable" }, { status: 400 });
      }
      // Digital products have unlimited "stock"
      if (product.productType === "physical" && product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuffisant pour ${product.name}` },
          { status: 400 }
        );
      }
      total += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
        productType: product.productType,
      });
      if (product.productType === "physical") {
        product.stock -= item.quantity;
        await product.save();
      }
    }

    const order = await Order.create({
      user: user.userId,
      items: orderItems,
      total,
      shippingAddress,
      status: status || (paymentMethod === "paypal" ? "paid" : "pending"),
      paymentMethod: paymentMethod || "none",
      paypalOrderId: paypalOrderId || undefined,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur création commande" }, { status: 500 });
  }
}
