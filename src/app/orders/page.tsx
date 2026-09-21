"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Order } from "@/types";
import { Package, Download } from "lucide-react";

const statusLabels: Record<string, string> = {
  pending: "En attente de paiement",
  processing: "En cours de préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
  paid: "Payée",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  processing: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  shipped: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  delivered: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  cancelled: "bg-red-500/20 text-red-300 border border-red-500/30",
  paid: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
};

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const handleDownload = async (orderId: string, productId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`/api/download/${orderId}/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.downloadUrl) window.open(data.downloadUrl, "_blank");
      else alert(data.error || "Téléchargement impossible");
    } catch {
      alert("Erreur de téléchargement");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-stone-400">
        Chargement des commandes...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-3xl text-stone-100 mb-2">Mes commandes</h1>
      <p className="text-sm text-stone-500 mb-8">
        Suivi paiement et livraisons ·{" "}
        <Link href="/cgv" className="text-gold-400 hover:underline">
          Voir les CGV
        </Link>
      </p>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl mb-6">
          Commande enregistrée. Les fichiers numériques sont disponibles une fois le statut « payée ».
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-16 border border-white/10 rounded-2xl bg-stage-900/50">
          <Package className="w-14 h-14 text-stone-600 mx-auto mb-4" />
          <p className="text-stone-400 mb-4">Aucune commande pour le moment.</p>
          <Link href="/products" className="text-gold-400 hover:underline text-sm">
            Découvrir la musique
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border border-white/10 bg-stage-900/70 rounded-2xl p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <p className="text-sm text-stone-300">
                    Commande #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-stone-500">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {order.paymentMethod === "paypal" && (
                      <span className="ml-2 text-blue-400">· PayPal</span>
                    )}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    statusColors[order.status] || "bg-stone-700 text-stone-300"
                  }`}
                >
                  {statusLabels[order.status] || order.status}
                </span>
              </div>

              {/* Payment clarity */}
              <p className="text-xs mb-3 text-stone-400">
                Paiement :{" "}
                <span
                  className={
                    order.status === "paid" ||
                    order.status === "delivered" ||
                    order.status === "shipped" ||
                    order.status === "processing"
                      ? "text-emerald-400 font-medium"
                      : order.status === "cancelled"
                      ? "text-red-400"
                      : "text-amber-400 font-medium"
                  }
                >
                  {order.status === "pending"
                    ? "Non payé / en attente"
                    : order.status === "cancelled"
                    ? "Annulé"
                    : order.paymentMethod === "paypal" || order.status === "paid"
                    ? "Payé"
                    : "Voir statut"}
                </span>
              </p>

              {order.cancelReason && (
                <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-3">
                  Motif d&apos;annulation : {order.cancelReason}
                </p>
              )}

              <div className="space-y-2 mb-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-stone-300">
                      {item.name} × {item.quantity}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-stone-200">
                        {(item.price * item.quantity).toFixed(2)} €
                      </span>
                      {item.productType &&
                        item.productType !== "physical" &&
                        (order.status === "paid" || order.status === "delivered") && (
                          <button
                            onClick={() => handleDownload(order._id, item.product)}
                            className="flex items-center gap-1 text-gold-400 hover:text-gold-300 text-xs font-medium"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Télécharger
                          </button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between font-semibold">
                <span className="text-stone-400">Total</span>
                <span className="text-gold-400">{order.total.toFixed(2)} €</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-stone-400">Chargement...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
