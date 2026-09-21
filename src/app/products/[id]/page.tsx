"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Product, User } from "@/types";
import { useCartStore } from "@/lib/store";
import {
  ShoppingCart, Minus, Plus, ArrowLeft, Music, Video, Camera,
  Download, Crown,
} from "lucide-react";
import Link from "next/link";
import AudioPreview from "@/components/AudioPreview";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [dlMsg, setDlMsg] = useState("");
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data._id) setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((u) => { if (u._id) setUser(u); })
        .catch(() => {});
    }
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const hasSub =
    user?.subscriptionStatus === "active" &&
    user?.subscriptionExpiresAt &&
    new Date(user.subscriptionExpiresAt) > new Date();

  const handleSubDownload = async () => {
    if (!product) return;
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    setDlMsg("");
    try {
      const res = await fetch(`/api/download/sub/${product._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.downloadUrl) {
        window.open(data.downloadUrl, "_blank");
      } else {
        setDlMsg(data.error || "Téléchargement impossible");
      }
    } catch {
      setDlMsg("Erreur réseau");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="animate-pulse grid md:grid-cols-2 gap-10">
          <div className="bg-slate-200 aspect-square rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-500 mb-4">Produit introuvable</p>
        <Link href="/products" className="text-primary-600 hover:underline">Retour</Link>
      </div>
    );
  }

  const isDigital = ["music", "video", "photo", "digital"].includes(product.productType);
  const isMusic = product.productType === "music";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/products" className="inline-flex items-center gap-1 text-slate-500 hover:text-primary-600 mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Retour
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100">
            <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
          </div>

          {isMusic && product.previewUrl && (
            <AudioPreview
              src={product.previewUrl}
              previewDuration={product.previewDuration || 30}
              title={`Aperçu – ${product.name}`}
            />
          )}

          {product.productType === "video" && product.previewUrl && (
            <div className="rounded-xl overflow-hidden bg-black">
              <video
                src={product.previewUrl}
                controls
                className="w-full"
                controlsList="nodownload"
                onTimeUpdate={(e) => {
                  const v = e.currentTarget;
                  const limit = product.previewDuration || 30;
                  if (v.currentTime >= limit) {
                    v.pause();
                    v.currentTime = 0;
                  }
                }}
              />
              <p className="text-xs text-slate-400 p-2 text-center bg-slate-900">
                Aperçu limité à {product.previewDuration || 30}s
              </p>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm text-primary-600 font-medium uppercase tracking-wide">{product.category}</p>
            {isDigital && (
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                {isMusic && <Music className="w-3 h-3" />}
                {product.productType === "video" && <Video className="w-3 h-3" />}
                {product.productType === "photo" && <Camera className="w-3 h-3" />}
                Téléchargeable
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">{product.name}</h1>
          <p className="text-3xl font-bold text-primary-700 mb-6">{product.price.toFixed(2)} €</p>
          <p className="text-slate-600 leading-relaxed mb-6">{product.description}</p>

          {isDigital && (
            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-sm space-y-1">
              {product.format && <p><span className="text-slate-500">Format :</span> {product.format}</p>}
              {product.fileSize && <p><span className="text-slate-500">Taille :</span> {product.fileSize}</p>}
              {product.duration && (
                <p><span className="text-slate-500">Durée :</span> {Math.floor(product.duration / 60)} min {product.duration % 60}s</p>
              )}
            </div>
          )}

          {/* Music subscription CTA */}
          {isMusic && (
            <div className="mb-6">
              {hasSub ? (
                <div className="space-y-3">
                  <button
                    onClick={handleSubDownload}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
                  >
                    <Download className="w-5 h-5" />
                    Télécharger (abonnement actif)
                  </button>
                  {dlMsg && <p className="text-sm text-red-600">{dlMsg}</p>}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-amber-800 mb-3 flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    Avec un abonnement, téléchargez ce morceau et tout le catalogue en illimité.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/subscription"
                      className="inline-flex items-center gap-1 bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-amber-600 transition"
                    >
                      Voir les abonnements
                    </Link>
                    <span className="text-sm text-slate-500 self-center">ou achetez à l&apos;unité ↓</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isDigital && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm text-slate-500">Quantité :</span>
              <div className="flex items-center border border-slate-300 rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-slate-50"><Minus className="w-4 h-4" /></button>
                <span className="px-4 font-medium">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-2 hover:bg-slate-50"><Plus className="w-4 h-4" /></button>
              </div>
              <span className="text-sm text-slate-400">{product.stock} en stock</span>
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={!isDigital && product.stock === 0}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold transition ${
              added
                ? "bg-green-600 text-white"
                : !isDigital && product.stock === 0
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-200"
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            {added
              ? "Ajouté !"
              : !isDigital && product.stock === 0
              ? "Rupture"
              : isMusic
              ? "Acheter à l'unité"
              : "Ajouter au panier"}
          </button>
        </div>
      </div>
    </div>
  );
}
