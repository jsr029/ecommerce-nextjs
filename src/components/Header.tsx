"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/store";
import { ShoppingCart, User, Calendar, Shield, Crown, Radio, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function Header() {
  const totalItems = useCartStore((s) => s.totalItems);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ name: string; role?: string; subscriptionStatus?: string } | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
    fetch("/api/live")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.some((s: { isLive?: boolean }) => s.isLive)) {
          setIsLive(true);
        }
      })
      .catch(() => {});
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const links = (
    <>
      <Link href="/" className="text-stone-400 hover:text-gold-400 transition text-sm tracking-wide" onClick={() => setMenuOpen(false)}>
        Accueil
      </Link>
      <Link href="/products" className="text-stone-400 hover:text-gold-400 transition text-sm tracking-wide" onClick={() => setMenuOpen(false)}>
        Musique
      </Link>
      <Link href="/live" className="text-stone-400 hover:text-red-400 transition text-sm tracking-wide flex items-center gap-1.5" onClick={() => setMenuOpen(false)}>
        <Radio className="w-3.5 h-3.5" />
        Live
        {isLive && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
      </Link>
      <Link href="/events" className="text-stone-400 hover:text-gold-400 transition text-sm tracking-wide flex items-center gap-1.5" onClick={() => setMenuOpen(false)}>
        <Calendar className="w-3.5 h-3.5" />
        Concerts
      </Link>
      <Link href="/subscription" className="text-gold-500 hover:text-gold-400 transition text-sm tracking-wide flex items-center gap-1.5" onClick={() => setMenuOpen(false)}>
        <Crown className="w-3.5 h-3.5" />
        Fan Club
      </Link>
      {user && (
        <Link href="/orders" className="text-stone-400 hover:text-gold-400 transition text-sm tracking-wide" onClick={() => setMenuOpen(false)}>
          Mes commandes
        </Link>
      )}
      {user?.role === "admin" && (
        <Link href="/admin" className="text-purple-400 hover:text-purple-300 transition text-sm tracking-wide flex items-center gap-1.5" onClick={() => setMenuOpen(false)}>
          <Shield className="w-3.5 h-3.5" />
          Admin
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-stage-950/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          <Link href="/" className="font-display text-2xl md:text-3xl font-semibold tracking-[0.15em] text-gold-gradient">
            LUNA
          </Link>

          <nav className="hidden lg:flex items-center gap-7">{links}</nav>

          <div className="flex items-center gap-3">
            <Link href="/cart" className="relative p-2 text-stone-400 hover:text-gold-400 transition">
              <ShoppingCart className="w-5 h-5" />
              {mounted && totalItems() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gold-500 text-stage-950 text-[10px] font-bold rounded-full w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center">
                  {totalItems()}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-xs text-stone-500">
                  {user.name}
                  {user.subscriptionStatus === "active" && (
                    <span className="ml-1.5 text-[10px] bg-gold-500/20 text-gold-400 px-1.5 py-0.5 rounded">Fan</span>
                  )}
                </span>
                <button onClick={logout} className="text-xs text-stone-500 hover:text-red-400 transition">
                  Sortir
                </button>
              </div>
            ) : (
              <Link href="/login" className="hidden sm:flex items-center gap-1.5 text-stone-400 hover:text-gold-400 transition text-sm">
                <User className="w-4 h-4" />
                Connexion
              </Link>
            )}

            <button
              className="lg:hidden p-2 text-stone-400"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-white/5 bg-stage-900 px-4 py-4 flex flex-col gap-4">
          {links}
          {!user && (
            <Link href="/login" className="text-stone-400 text-sm" onClick={() => setMenuOpen(false)}>
              Connexion
            </Link>
          )}
          {user && (
            <button onClick={logout} className="text-left text-stone-500 text-sm">
              Déconnexion
            </button>
          )}
        </div>
      )}
    </header>
  );
}
