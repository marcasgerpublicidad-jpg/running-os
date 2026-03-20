/**
 * app/api/auth/strava/callback/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * OAuth Step 2: Handles the Strava redirect callback.
 *
 * Strava redirects here with:
 *   ?code=<authorization_code>&scope=read,activity:read_all&state=<state>
 *
 * On error (user denied access):
 *   ?error=access_denied
 *
 * Set STRAVA_REDIRECT_URI to:
 *   http://localhost:3000/api/auth/strava/callback  (development)
 *   https://yourdomain.com/api/auth/strava/callback (production)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { type NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/lib/strava";
import { saveStravaSession } from "@/lib/stravaSession";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;

  // ── Error case: user denied authorization ──────────────────────────────────
  const error = searchParams.get("error");
  if (error) {
    console.warn("[Strava OAuth] User denied authorization:", error);
    const url = request.nextUrl.clone();
    url.pathname = "/connect";
    url.search = "?error=denied";
    return NextResponse.redirect(url);
  }

  // ── Happy path: exchange code for tokens ───────────────────────────────────
  const code = searchParams.get("code");
  if (!code) {
    const url = request.nextUrl.clone();
    url.pathname = "/connect";
    url.search = "?error=no_code";
    return NextResponse.redirect(url);
  }

  try {
    const tokenResponse = await exchangeCodeForToken(code);

    // Persist tokens in httpOnly cookies
    await saveStravaSession(tokenResponse);

    console.log(
      `[Strava OAuth] Athlete ${tokenResponse.athlete?.firstname} ${tokenResponse.athlete?.lastname} connected.`
    );

    // Redirect to dashboard
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "?connected=true";
    return NextResponse.redirect(url);

  } catch (err) {
    console.error("[Strava OAuth] Token exchange error:", err);
    const url = request.nextUrl.clone();
    url.pathname = "/connect";
    url.search = "?error=token_exchange";
    return NextResponse.redirect(url);
  }
}
