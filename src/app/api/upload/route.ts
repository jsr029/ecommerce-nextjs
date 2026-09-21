import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/auth";

/**
 * Upload media to Vercel Blob (persistent cloud storage).
 * Vercel serverless has NO durable local filesystem — never write to /tmp for production assets.
 *
 * Limits:
 * - Hobby: request body ~4.5 MB — use client-side put() for large files if needed
 * - Supports images, audio, video via Content-Type
 *
 * Returns: { url, pathname, contentType, size }
 */
export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Admin requis" }, { status: 403 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "BLOB_READ_WRITE_TOKEN manquant. Créez un store Blob dans Vercel → Storage, ou collez le token en local.",
      },
      { status: 503 }
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("file") as File | null;
    const folder = (form.get("folder") as string) || "media";

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier (field: file)" }, { status: 400 });
    }

    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/x-wav",
      "audio/mp4",
      "audio/aac",
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "application/zip",
      "application/x-zip-compressed",
    ];

    if (!allowed.includes(file.type) && !file.type.startsWith("image/") && !file.type.startsWith("audio/") && !file.type.startsWith("video/")) {
      return NextResponse.json(
        { error: `Type non autorisé: ${file.type}. Images, audio, vidéo, zip uniquement.` },
        { status: 400 }
      );
    }

    // Soft limit warning for serverless body (Hobby ~4.5MB)
    const maxBytes = 4.5 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        {
          error: `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} Mo). Sur le plan Hobby Vercel, limite ~4.5 Mo via API. Utilisez un fichier plus léger, Cloudinary, ou S3 pour les gros médias.`,
        },
        { status: 413 }
      );
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const pathname = `${folder}/${Date.now()}-${safeName}`;

    const blob = await put(pathname, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: file.type,
    });

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      contentType: file.type,
      size: file.size,
    });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur upload" },
      { status: 500 }
    );
  }
}
