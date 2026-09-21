"use client";

import { useCartStore } from "@/lib/store";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, clearCart } =
    useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-400">
        Chargement...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Votre panier est vide
        </h1>
        <p className="text-slate-500 mb-6">
          Découvrez nos produits et ajoutez-les à votre panier.
        </p>
        <Link
          href="/products"
          className="inline-block bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition"
        >
          Voir le catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Mon panier</h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-600 transition"
        >
          Vider le panier
        </button>
      </div>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div
            key={item.product._id}
            className="flex gap-4 bg-white border border-slate-200 rounded-xl p-4"
          >
            <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-slate-100 shrink-0">
              <Image
                src={item.product.image}
                alt={item.product.name}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/products/${item.product._id}`}
                className="font-semibold text-slate-900 hover:text-primary-600 transition line-clamp-1"
              >
                {item.product.name}
              </Link>
              <p className="text-sm text-slate-500 mt-0.5">
                {item.product.price.toFixed(2)} €
              </p>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center border border-slate-300 rounded-lg">
                  <button
                    onClick={() =>
                      updateQuantity(item.product._id, item.quantity - 1)
                    }
                    className="p-1.5 hover:bg-slate-50"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-sm font-normal">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.product._id, item.quantity + 1)
                    }
                    className="p-1.5 hover:bg-slate-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.product._id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-right font-semibold text-slate-900">
              {(item.product.price * item.quantity).toFixed(2)} €
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 rounded-2xl p-6">
        <div className="flex justify-between text-lg mb-4">
          <span className="text-slate-600">Total</span>
          <span className="font-bold text-slate-900">
            {totalPrice().toFixed(2)} €
          </span>
        </div>
        <Link
          href="/checkout"
          className="block w-full text-center bg-primary-600 text-white py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary-200"
        >
          Passer la commande
        </Link>
      </div>
    </div>
  );
}
