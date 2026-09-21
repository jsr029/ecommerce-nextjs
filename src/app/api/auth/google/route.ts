import { NextRequest, NextResponse } from "next/server";

/**
 * Start Google OAuth — redirects user to Google consent screen.
 * GET /api/auth/google
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      {
        error:
          "GOOGLE_CLIENT_ID non configuré. Créez un projet sur Google Cloud Console → OAuth 2.0 Client ID (Web).",
      },
      { status: 503 }
    );
  }

  const origin =
    process.env.BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : request.nextUrl.origin);

  const redirectUri = `${origin.replace(/\/$/, "")}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
