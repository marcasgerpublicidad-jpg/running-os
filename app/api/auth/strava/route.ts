/**
 * app/api/auth/strava/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * OAuth Step 1: Redirect the user to Strava's authorization page.
 *
 * Usage: link to /api/auth/strava from the connect button.
 * Strava will redirect back to STRAVA_REDIRECT_URI (/api/auth/strava/callback).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { redirect } from "next/navigation";
import { buildStravaAuthUrl } from "@/lib/strava";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<never | Response> {
  // Generate a simple CSRF state token (in production, use a cryptographic random value
  // stored in session, then verify it matches in the callback)
  const state = Math.random().toString(36).slice(2);
  let authUrl: string;

  try {
    authUrl = buildStravaAuthUrl(state);
  } catch {
    // If env config is missing (e.g. during `next build` without .env.local),
    // don't crash the build. Send user to /connect with a clear message.
    const url = request.nextUrl.clone();
    url.pathname = "/connect";
    url.search = "?error=config";
    redirect(url.toString());
  }

  redirect(authUrl);
}
