import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "commondatastorage.googleapis.com" },
      { protocol: "https", hostname: "www.soundhelix.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Vercel Blob — pathnames vary by store id
      { protocol: "https", hostname: "public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "blob.vercel-storage.com" },
    ],
    // Allow any https image host in production (Blob URLs are store-specific)
    dangerouslyAllowSVG: false,
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
