import Link from "next/link";
import { getBaseUrl } from "@/lib/baseUrl";
import ProductCard from "@/components/ProductCard";
import { Product, Event } from "@/types";
import { ArrowRight, MapPin } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const base = getBaseUrl();
    const res = await fetch(`${base}/api/products?featured=true`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getFeaturedEvents(): Promise<Event[]> {
  try {
    const base = getBaseUrl();
    const res = await fetch(`${base}/api/events?featured=true`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [products, events] = await Promise.all([
    getFeaturedProducts(),
    getFeaturedEvents(),
  ]);

  return (
    <div className="bg-stage-glow">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&h=900&fit=crop)",
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stage-950/70 via-stage-950/85 to-stage-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 text-center">
          <p className="text-[11px] uppercase tracking-[0.35em] text-gold-500 mb-6">
            Nouvel album disponible
          </p>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold text-stone-50 tracking-tight leading-none mb-6">
            LUNA
          </h1>
          <p className="font-display text-xl md:text-2xl text-stone-400 italic max-w-lg mx-auto mb-10">
            La voix, la scène, l&apos;instant
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-gold-500 text-stage-950 font-semibold px-8 py-3.5 rounded-full hover:bg-gold-400 transition tracking-wide text-sm"
            >
              Écouter & télécharger
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/live"
              className="inline-flex items-center gap-2 border border-red-500/50 text-red-400 font-medium px-8 py-3.5 rounded-full hover:bg-red-500/10 transition text-sm"
            >
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Live maintenant
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 border border-white/15 text-stone-300 font-medium px-8 py-3.5 rounded-full hover:border-gold-500/40 hover:text-gold-400 transition text-sm"
            >
              Dates de tournée
            </Link>
          </div>
        </div>
      </section>

      {/* Featured releases */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-gold-500 mb-2">Discographie</p>
            <h2 className="font-display text-3xl md:text-4xl text-stone-100">Sorties exclusives</h2>
          </div>
          <Link href="/products" className="text-sm text-stone-500 hover:text-gold-400 transition flex items-center gap-1">
            Tout voir <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 border border-white/5 rounded-2xl bg-stage-900/50">
            <p className="text-stone-500 mb-3">Aucun titre pour le moment.</p>
            <code className="text-xs text-stone-600 bg-stage-800 px-3 py-1 rounded">npm run seed</code>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Tour dates teaser */}
      {events.length > 0 && (
        <section className="border-y border-white/5 bg-stage-900/40 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-gold-500 mb-2">Sur scène</p>
                <h2 className="font-display text-3xl md:text-4xl text-stone-100">Prochaines dates</h2>
              </div>
              <Link href="/events" className="text-sm text-stone-500 hover:text-gold-400 transition flex items-center gap-1">
                Calendrier <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {events.slice(0, 3).map((event) => (
                <Link
                  key={event._id}
                  href="/events"
                  className="group border border-white/5 bg-stage-800/40 rounded-2xl overflow-hidden hover:border-gold-500/30 transition"
                >
                  <div
                    className="h-36 bg-cover bg-center"
                    style={{ backgroundImage: `url(${event.image})` }}
                  />
                  <div className="p-5">
                    <p className="text-[11px] uppercase tracking-wider text-gold-500 mb-1">
                      {format(new Date(event.date), "EEE d MMM yyyy · HH:mm", { locale: fr })}
                    </p>
                    <h3 className="font-display text-xl text-stone-100 group-hover:text-gold-400 transition">
                      {event.title}
                    </h3>
                    <p className="text-sm text-stone-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {event.city}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Fan club CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative rounded-3xl overflow-hidden border border-gold-500/20 bg-gradient-to-br from-purple-950/50 via-stage-900 to-stage-950 p-10 md:p-14 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold-500 mb-3">Fan Club</p>
          <h2 className="font-display text-3xl md:text-4xl text-stone-50 mb-4">
            Téléchargez toute la discographie
          </h2>
          <p className="text-stone-400 max-w-md mx-auto mb-8 text-sm leading-relaxed">
            Abonnement mensuel ou annuel — accès illimité aux singles, EPs et albums.
            Sans abo : préécoute ou achat à l&apos;unité.
          </p>
          <Link
            href="/subscription"
            className="inline-flex items-center gap-2 bg-gold-500 text-stage-950 font-semibold px-8 py-3 rounded-full hover:bg-gold-400 transition text-sm"
          >
            Rejoindre le Fan Club
          </Link>
        </div>
      </section>
    </div>
  );
}
