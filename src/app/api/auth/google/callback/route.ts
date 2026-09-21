import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-change-me";

/**
 * Google OAuth callback — exchange code, upsert user, issue JWT, redirect to app.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  const origin =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : request.nextUrl.origin);
  const base = origin.replace(/\/$/, "");

  if (error || !code) {
    return NextResponse.redirect(
      `${base}/login?error=${encodeURIComponent(error || "oauth_denied")}`
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${base}/login?error=google_not_configured`);
  }

  const redirectUri = `${base}/api/auth/google/callback`;

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("Google token error:", tokenData);
      return NextResponse.redirect(`${base}/login?error=token_exchange`);
    }

    // User profile
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();
    if (!profile.email) {
      return NextResponse.redirect(`${base}/login?error=no_email`);
    }

    await dbConnect();

    let user = await User.findOne({
      $or: [{ email: profile.email.toLowerCase() }, { googleId: profile.sub }],
    });

    if (!user) {
      user = await User.create({
        name: profile.name || profile.email.split("@")[0],
        email: profile.email.toLowerCase(),
        googleId: profile.sub,
        image: profile.picture,
        authProvider: "google",
        role: "user",
      });
    } else {
      // Link Google to existing account
      if (!user.googleId) user.googleId = profile.sub;
      if (profile.picture && !user.image) user.image = profile.picture;
      if (user.authProvider === "local" && !user.googleId) {
        user.authProvider = "google";
      }
      // Keep dual: if had local password, still local; mark google linked
      if (!user.authProvider) user.authProvider = "google";
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Redirect to client page that stores token in localStorage
    const params = new URLSearchParams({
      token,
      name: user.name,
      email: user.email,
      role: user.role,
      id: String(user._id),
    });
    return NextResponse.redirect(`${base}/auth/callback?${params.toString()}`);
  } catch (e) {
    console.error("Google OAuth error:", e);
    return NextResponse.redirect(`${base}/login?error=oauth_failed`);
  }
}
