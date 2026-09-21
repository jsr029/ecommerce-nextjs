"use client";

import { useState, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";

interface Props {
  /** image | audio | video | any */
  accept?: string;
  folder?: string;
  label?: string;
  onUploaded: (url: string) => void;
  className?: string;
}

/**
 * Admin helper: upload file to Vercel Blob, returns public URL.
 */
export default function MediaUpload({
  accept = "image/*,audio/*,video/*",
  folder = "media",
  label = "Uploader un fichier",
  onUploaded,
  className = "",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Échec upload");
        return;
      }
      onUploaded(data.url);
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handle}
        className="hidden"
        id={`upload-${folder}-${label}`}
      />
      <label
        htmlFor={`upload-${folder}-${label}`}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition ${
          loading
            ? "bg-stone-700 text-stone-400"
            : "bg-purple-600/80 text-white hover:bg-purple-500"
        }`}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Upload className="w-3.5 h-3.5" />
        )}
        {loading ? "Upload..." : label}
      </label>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
