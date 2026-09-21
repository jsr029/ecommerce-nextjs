"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function CallbackInner() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = params.get("token");
    const name = params.get("name");
    const email = params.get("email");
    const role = params.get("role");
    const id = params.get("id");

    if (!token || !email) {
      router.replace("/login?error=oauth_failed");
      return;
    }

    localStorage.setItem("token", token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        _id: id,
        name,
        email,
        role: role || "user",
      })
    );

    // Refresh full profile (subscription, etc.)
    fetch("/api/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((me) => {
        if (me._id) localStorage.setItem("user", JSON.stringify(me));
      })
      .finally(() => {
        window.location.href = "/";
      });
  }, [params, router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center text-stone-400">
      Connexion Google en cours…
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-stone-400">Chargement…</div>}>
      <CallbackInner />
    </Suspense>
  );
}
