"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { useCartStore } from "@/lib/store";
import { ShoppingCart, Check, Music, Video, Camera, Package } from "lucide-react";
import { useState } from "react";

interface Props {
  product: Product;
}

const typeIcons: Record<string, React.ReactNode> = {
  music: <Music className="w-3 h-3" />,
  video: <Video className="w-3 h-3" />,
  photo: <Camera className="w-3 h-3" />,
  physical: <Package className="w-3 h-3" />,
  digital: <Package className="w-3 h-3" />,
};

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link
      href={`/products/${product._id}`}
      className="group block bg-stage-800/50 border border-white/5 rounded-2xl overflow-hidden hover:border-gold-500/30 hover:shadow-[0_0_40px_-12px_rgba(212,175,55,0.25)] transition-all duration-500"
    >
      <div className="relative aspect-square overflow-hidden bg-stage-900">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          sizes="(max-width: 768px) 100vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stage-950/80 via-transparent to-transparent opacity-60" />
        {product.featured && (
          <span className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.15em] bg-gold-500 text-stage-950 font-semibold px-2.5 py-1 rounded-full">
            Exclusif
          </span>
        )}
        {product.productType && product.productType !== "physical" && (
          <span className="absolute top-3 right-3 bg-black/60 backdrop-blur text-stone-300 text-[10px] font-medium px-2 py-1 rounded-full flex items-center gap-1">
            {typeIcons[product.productType]}
            {product.productType === "music" ? "Audio" : product.productType}
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-1">
          {product.category}
        </p>
        <h3 className="font-display text-lg text-stone-100 group-hover:text-gold-400 transition line-clamp-2 mb-3">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-gold-400 font-medium">
            {product.price.toFixed(2)} €
          </span>
          <button
            onClick={handleAdd}
            disabled={product.productType === "physical" && product.stock === 0}
            className={`p-2.5 rounded-full transition ${
              added
                ? "bg-emerald-500 text-white"
                : "bg-white/5 text-stone-300 hover:bg-gold-500 hover:text-stage-950"
            }`}
          >
            {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </Link>
  );
}
