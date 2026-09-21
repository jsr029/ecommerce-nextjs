/**
 * Parse JSON only if response looks like JSON — avoids
 * SyntaxError: Unexpected token '<' when API returns HTML error pages.
 */
export async function safeJson<T = unknown>(res: Response): Promise<T | null> {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const text = await res.text().catch(() => "");
    console.error(
      `[safeJson] Non-JSON response ${res.status} ${res.url}:`,
      text.slice(0, 200)
    );
    return null;
  }
  try {
    return (await res.json()) as T;
  } catch (e) {
    console.error("[safeJson] parse failed", e);
    return null;
  }
}
