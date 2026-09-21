"use client";

import { useEffect, useState } from "react";
import { LiveStream } from "@/types";
import LivePlayer from "@/components/LivePlayer";
import { Radio, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function LivePage() {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<LiveStream | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/live")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setStreams(list);
        const live = list.find((s: LiveStream) => s.isLive);
        setSelected(live || list[0] || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // Refresh live status every 30s
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  const liveCount = streams.filter((s) => s.isLive).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Radio className="w-8 h-8 text-red-600" />
            Streaming en direct
          </h1>
          <p className="text-slate-500 mt-1">
            {liveCount > 0
              ? `${liveCount} flux en direct actuellement`
              : "Aucun flux en direct pour le moment"}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition px-3 py-2 rounded-lg hover:bg-slate-100"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {loading && !selected ? (
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      ) : selected ? (
        <div className="space-y-6">
          <LivePlayer stream={selected} />

          {streams.length > 1 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-3">Autres flux</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {streams
                  .filter((s) => s._id !== selected._id)
                  .map((s) => (
                    <button
                      key={s._id}
                      onClick={() => setSelected(s)}
                      className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-primary-300 hover:shadow-sm transition text-left"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={s.coverImage}
                        alt=""
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-normal text-slate-900 truncate">{s.title}</p>
                          {s.isLive && (
                            <span className="shrink-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {s.djName || s.genre || "Radio"}
                        </p>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-2xl">
          <Radio className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 mb-2">Aucun stream configuré.</p>
          <p className="text-sm text-slate-400 mb-4">
            L&apos;admin peut ajouter un flux dans le panneau Admin → Live.
          </p>
          <code className="text-xs bg-slate-200 px-2 py-1 rounded">npm run seed</code>
        </div>
      )}

      <div className="mt-12 bg-slate-50 rounded-2xl p-6 text-sm text-slate-600">
        <h3 className="font-semibold text-slate-800 mb-2">À propos du streaming</h3>
        <ul className="space-y-1 list-disc list-inside">
          <li>Lecture en direct via HTML5 Audio (Icecast, Shoutcast, MP3 stream, etc.)</li>
          <li>L&apos;admin active/désactive le statut « En direct » et définit l&apos;URL du flux</li>
          <li>
            Exemples d&apos;URL de démo inclus dans le seed (flux audio publics)
          </li>
          <li>
            Pour un vrai radio : pointez vers votre serveur Icecast / Azure / AWS / Cloudflare Stream
          </li>
        </ul>
        <p className="mt-3">
          <Link href="/subscription" className="text-primary-600 hover:underline">
            Abonnez-vous
          </Link>{" "}
          pour télécharger les morceaux du catalogue après l&apos;écoute live.
        </p>
      </div>
    </div>
  );
}
