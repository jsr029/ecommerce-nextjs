"use client";

import { useRef, useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";

interface Props {
  src: string;
  previewDuration?: number; // seconds
  title?: string;
}

export default function AudioPreview({ src, previewDuration = 30, title }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [limited, setLimited] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      setCurrent(audio.currentTime);
      if (audio.currentTime >= previewDuration) {
        audio.pause();
        audio.currentTime = 0;
        setPlaying(false);
        setLimited(true);
        setTimeout(() => setLimited(false), 3000);
      }
    };
    const onEnded = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
    };
  }, [previewDuration]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  };

  const pct = Math.min(100, (current / previewDuration) * 100);

  return (
    <div className="bg-slate-900 text-white rounded-xl p-4">
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          className="w-12 h-12 rounded-full bg-primary-500 hover:bg-primary-400 flex items-center justify-center transition shrink-0"
        >
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{title || "Aperçu gratuit"}</p>
          <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-400 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>{Math.floor(current)}s</span>
            <span>Aperçu {previewDuration}s</span>
          </div>
        </div>
      </div>
      {limited && (
        <p className="text-xs text-amber-300 mt-2">
          Aperçu terminé — achetez pour télécharger la version complète.
        </p>
      )}
    </div>
  );
}
