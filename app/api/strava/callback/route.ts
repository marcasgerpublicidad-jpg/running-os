/**
 * app/api/strava/callback/route.ts
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
 *   http://localhost:3000/api/strava/callback  (development)
 *   https://yourdomain.com/api/strava/callback (production)
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
    return NextResponse.redirect(new URL("/connect?error=denied", request.url));
  }

  // ── Happy path: exchange code for tokens ───────────────────────────────────
  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/connect?error=no_code", request.url));
  }

  try {
    const tokenResponse = await exchangeCodeForToken(code);

    // Persist tokens in httpOnly cookies
    await saveStravaSession(tokenResponse);

    console.log(
      `[Strava OAuth] Athlete ${tokenResponse.athlete?.firstname} ${tokenResponse.athlete?.lastname} connected.`
    );

    // Redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard?connected=true", request.url));

  } catch (err) {
    console.error("[Strava OAuth] Token exchange error:", err);
    return NextResponse.redirect(new URL("/connect?error=token_exchange", request.url));
  }
}
