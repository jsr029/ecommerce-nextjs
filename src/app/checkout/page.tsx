"use client";

import { useCartStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const PayPalButton = dynamic(() => import("@/components/PayPalButton"), {
  ssr: false,
  loading: () => <div className="h-12 bg-slate-100 rounded animate-pulse" />,
});

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "France",
  });

  useEffect(() => {
    setMounted(true);
    const user = localStorage.getItem("user");
    if (!user) router.push("/login");
  }, [router]);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-500 mb-4">Votre panier est vide.</p>
        <Link href="/products" className="text-primary-600 hover:underline">
          Continuer vos achats
        </Link>
      </div>
    );
  }

  const hasPhysical = items.some((i) => i.product.productType === "physical");

  const createOrder = async (paymentMethod: string, paypalOrderId?: string) => {
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.product._id,
            name: i.product.name,
            quantity: i.quantity,
          })),
          shippingAddress: form,
          paymentMethod,
          paypalOrderId,
          status: paymentMethod === "paypal" ? "paid" : "pending",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de la commande");
        return;
      }

      clearCart();
      router.push("/orders?success=1");
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createOrder("none");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            {hasPhysical ? "Adresse de livraison" : "Coordonnées"}
          </h2>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="space-y-4">
            {(
              [
                ["fullName", "Nom complet"],
                ["address", hasPhysical ? "Adresse" : "Adresse (facturation)"],
                ["city", "Ville"],
                ["postalCode", "Code postal"],
                ["country", "Pays"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm font-normal text-slate-700 mb-1">
                  {label}
                </label>
                <input
                  type="text"
                  required
                  value={form[key]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            ))}

            <div className="pt-4 border-t border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-3">Payer avec PayPal</h3>
              <PayPalButton
                amount={totalPrice()}
                disabled={loading || !form.fullName || !form.address}
                onSuccess={(paypalOrderId) => createOrder("paypal", paypalOrderId)}
              />
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 text-slate-400">ou</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full border border-slate-300 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 transition disabled:opacity-50"
            >
              {loading ? "Traitement..." : `Commander sans paiement (${totalPrice().toFixed(2)} €)`}
            </button>
            <p className="text-xs text-stone-500 text-center">
              Mode démo : sans paiement → statut « en attente ». En commandant vous acceptez les{" "}
              <a href="/cgv" className="text-gold-400 hover:underline">CGV</a>.
            </p>
          </form>
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 h-fit">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Récapitulatif</h2>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.product._id} className="flex justify-between text-sm">
                <span className="text-slate-600">
                  {item.product.name} × {item.quantity}
                  {item.product.productType !== "physical" && (
                    <span className="text-xs text-primary-600 ml-1">(digital)</span>
                  )}
                </span>
                <span className="font-normal">
                  {(item.product.price * item.quantity).toFixed(2)} €
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200 pt-4 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{totalPrice().toFixed(2)} €</span>
          </div>
        </div>
      </div>
    </div>
  );
}
