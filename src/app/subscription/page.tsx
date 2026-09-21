"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SubscriptionPlan, User } from "@/types";
import { Check, Crown, Music } from "lucide-react";
import dynamic from "next/dynamic";

const PayPalButton = dynamic(() => import("@/components/PayPalButton"), {
  ssr: false,
  loading: () => <div className="h-12 bg-slate-100 rounded animate-pulse" />,
});

export default function SubscriptionPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<"monthly" | "yearly" | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    Promise.all([
      fetch("/api/subscriptions").then((r) => r.json()),
      fetch("/api/me", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([plansData, userData]) => {
        setPlans(Array.isArray(plansData) ? plansData : []);
        if (userData._id) setUser(userData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const isActive =
    user?.subscriptionStatus === "active" &&
    user?.subscriptionExpiresAt &&
    new Date(user.subscriptionExpiresAt) > new Date();

  const handleSubscribe = async (paypalOrderId: string) => {
    if (!selected) return;
    setError("");
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/subscriptions/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planSlug: selected, paypalOrderId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur");
        return;
      }
      setMessage("Abonnement activé ! Vous pouvez télécharger tous les morceaux.");
      // Refresh user
      const me = await fetch("/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());
      if (me._id) {
        setUser(me);
        localStorage.setItem("user", JSON.stringify(me));
      }
      setSelected(null);
    } catch {
      setError("Erreur réseau");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-400">
        Chargement...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-10">
        <Crown className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-slate-900">Abonnement Musique</h1>
        <p className="text-slate-500 mt-2 max-w-xl mx-auto">
          Sans abonnement : écoutez un échantillon gratuit ou achetez morceau par morceau.
          Avec un abonnement : téléchargez <strong>tout le catalogue musical</strong> en illimité.
        </p>
      </div>

      {isActive && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-8 text-center">
          <p className="text-green-800 font-semibold flex items-center justify-center gap-2">
            <Music className="w-5 h-5" />
            Abonnement {user?.subscriptionPlan} actif
          </p>
          <p className="text-sm text-green-600 mt-1">
            Expire le{" "}
            {user?.subscriptionExpiresAt &&
              new Date(user.subscriptionExpiresAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
          </p>
        </div>
      )}

      {message && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl mb-6 text-center">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-center">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {plans.map((plan) => (
          <div
            key={plan._id}
            className={`border-2 rounded-2xl p-6 transition ${
              selected === plan.slug
                ? "border-primary-500 shadow-lg"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <h2 className="text-xl font-bold text-slate-900">{plan.name}</h2>
            <p className="text-3xl font-bold text-primary-700 mt-2">
              {plan.price.toFixed(2)} €
              <span className="text-sm font-normal text-slate-400">
                /{plan.slug === "monthly" ? "mois" : "an"}
              </span>
            </p>
            <p className="text-sm text-slate-500 mt-2">{plan.description}</p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setSelected(plan.slug)}
              disabled={Boolean(isActive && user?.subscriptionPlan === plan.slug)}
              className={`mt-6 w-full py-3 rounded-xl font-semibold transition ${
                selected === plan.slug
                  ? "bg-primary-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              } disabled:opacity-50`}
            >
              {isActive && user?.subscriptionPlan === plan.slug
                ? "Plan actuel"
                : selected === plan.slug
                ? "Sélectionné"
                : "Choisir"}
            </button>
          </div>
        ))}
      </div>

      {selected && (
        <div className="max-w-md mx-auto bg-slate-50 rounded-2xl p-6">
          <h3 className="font-semibold text-center mb-4">
            Payer l&apos;abonnement {selected === "monthly" ? "mensuel" : "annuel"}
          </h3>
          <PayPalButton
            amount={plans.find((p) => p.slug === selected)?.price || 0}
            onSuccess={handleSubscribe}
          />
        </div>
      )}

      <div className="mt-12 bg-slate-50 rounded-2xl p-6 text-sm text-slate-600">
        <h3 className="font-semibold text-slate-800 mb-2">Comment ça marche ?</h3>
        <ul className="space-y-1 list-disc list-inside">
          <li>Sans abonnement : préécoute gratuite (30–45 s) ou achat à l&apos;unité</li>
          <li>Avec abonnement actif : bouton « Télécharger » sur tous les morceaux musique</li>
          <li>Les vidéos et packs photos restent à l&apos;achat unitaire</li>
          <li>L&apos;abonnement se renouvelle manuellement (pas de prélèvement auto en démo)</li>
        </ul>
      </div>
    </div>
  );
}
