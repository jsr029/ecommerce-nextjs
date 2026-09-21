/**
 * Absolute site URL — only for cases that truly need an absolute URL
 * (OAuth redirects, emails). Prefer querying the DB in Server Components
 * instead of fetch(`${baseUrl}/api/...`) to avoid HTML error pages.
 */
export function getBaseUrl() {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL.replace(/\/$/, "");
  }
  // Vercel system env (no protocol)
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
