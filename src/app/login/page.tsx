"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import GoogleButton from "@/components/GoogleButton";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const err = searchParams.get("error");
    if (!err) return;
    const map: Record<string, string> = {
      oauth_denied: "Connexion Google annulée",
      google_not_configured: "Google OAuth non configuré (variables d'environnement)",
      token_exchange: "Échec de l'échange de token Google",
      no_email: "Email Google indisponible",
      oauth_failed: "Échec de la connexion Google",
    };
    setError(map[err] || err);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur de connexion");
        return;
      }
      localStorage.setItem("token", data.token);
      const meRes = await fetch("/api/me", {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      const me = await meRes.json();
      localStorage.setItem("user", JSON.stringify(me._id ? me : data.user));
      window.location.href = "/";
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md border border-white/10 bg-stage-900/80 rounded-2xl p-8 shadow-2xl">
        <p className="font-display text-3xl text-center text-gold-gradient tracking-[0.15em] mb-2">LUNA</p>
        <h1 className="text-center text-stone-400 text-sm mb-8 tracking-wide">Connexion</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <GoogleButton />

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-stage-900 px-3 text-stone-500">ou email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-stage-800 border border-white/10 rounded-xl text-stone-100 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
              placeholder="vous@email.com"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1.5">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-stage-800 border border-white/10 rounded-xl text-stone-100 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-500 text-stage-950 py-3 rounded-xl font-semibold hover:bg-gold-400 transition disabled:opacity-50"
          >
            {loading ? "..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          Pas de compte ?{" "}
          <Link href="/register" className="text-gold-400 hover:underline">
            S&apos;inscrire
          </Link>
        </p>

        <div className="mt-6 p-3 bg-stage-800/50 rounded-xl text-[11px] text-stone-500 space-y-1">
          <p className="text-stone-400 font-normal">Démo email</p>
          <p>admin@shop.com / admin123</p>
          <p>user@shop.com / user123</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-stone-400">Chargement…</div>}>
      <LoginForm />
    </Suspense>
  );
}
