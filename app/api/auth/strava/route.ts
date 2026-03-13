/**
 * app/api/auth/strava/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * OAuth Step 1: Redirect the user to Strava's authorization page.
 *
 * Usage: link to /api/auth/strava from the connect button.
 * Strava will redirect back to STRAVA_REDIRECT_URI (/api/strava/callback).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { redirect } from "next/navigation";
import { buildStravaAuthUrl } from "@/lib/strava";

export async function GET(): Promise<never> {
  // Generate a simple CSRF state token (in production, use a cryptographic random value
  // stored in session, then verify it matches in the callback)
  const state = Math.random().toString(36).slice(2);

  const authUrl = buildStravaAuthUrl(state);
  redirect(authUrl);
}
