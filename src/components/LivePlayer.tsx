"use client";

import { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Radio } from "lucide-react";
import { LiveStream } from "@/types";

interface Props {
  stream: LiveStream;
}

export default function LivePlayer({ stream }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    // Reset when stream URL changes
    setPlaying(false);
    setError("");
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.load();
    }
  }, [stream.streamUrl]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    setError("");
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    setLoading(true);
    try {
      // Live streams often need reload to get latest buffer
      audio.load();
      await audio.play();
      setPlaying(true);
    } catch (e) {
      console.error(e);
      setError(
        "Impossible de lire le flux. Vérifiez l'URL du stream ou autorisez l'audio dans le navigateur."
      );
      setPlaying(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !muted;
    setMuted(!muted);
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl overflow-hidden shadow-xl">
      <div className="relative aspect-[16/9] sm:aspect-[21/9] bg-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={stream.coverImage}
          alt={stream.title}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        <div className="absolute top-4 left-4 flex items-center gap-2">
          {stream.isLive ? (
            <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              En direct
            </span>
          ) : (
            <span className="bg-slate-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              Hors antenne
            </span>
          )}
          {stream.genre && (
            <span className="bg-white/10 backdrop-blur text-xs px-2 py-1 rounded-full">
              {stream.genre}
            </span>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <div className="flex items-end gap-4">
            <button
              onClick={toggle}
              disabled={!stream.isLive || loading}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shrink-0 transition shadow-lg ${
                stream.isLive
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-slate-600 text-slate-400 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : playing ? (
                <Pause className="w-7 h-7" />
              ) : (
                <Play className="w-7 h-7 ml-1" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-300 flex items-center gap-1 mb-0.5">
                <Radio className="w-3.5 h-3.5" />
                {stream.djName || "Radio ShopNext"}
              </p>
              <h2 className="text-lg sm:text-xl font-bold truncate">{stream.title}</h2>
              <p className="text-sm text-slate-400 line-clamp-1">{stream.description}</p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button onClick={toggleMute} className="p-2 hover:bg-white/10 rounded-lg transition">
                {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setVolume(v);
                  setMuted(v === 0);
                  if (audioRef.current) {
                    audioRef.current.volume = v;
                    audioRef.current.muted = v === 0;
                  }
                }}
                className="w-24 accent-red-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile volume */}
      <div className="sm:hidden flex items-center gap-3 px-4 py-3 border-t border-slate-800">
        <button onClick={toggleMute} className="p-1">
          {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            setVolume(v);
            setMuted(v === 0);
            if (audioRef.current) {
              audioRef.current.volume = v;
              audioRef.current.muted = v === 0;
            }
          }}
          className="flex-1 accent-red-500"
        />
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-900/50 text-red-200 text-sm">{error}</div>
      )}

      <audio
        ref={audioRef}
        src={stream.isLive ? stream.streamUrl : undefined}
        preload="none"
        onError={() => {
          setError("Erreur de lecture du flux audio.");
          setPlaying(false);
        }}
        onWaiting={() => setLoading(true)}
        onPlaying={() => {
          setLoading(false);
          setPlaying(true);
        }}
        onPause={() => setPlaying(false)}
      />
    </div>
  );
}
