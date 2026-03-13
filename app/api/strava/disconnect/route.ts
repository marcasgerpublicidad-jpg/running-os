/**
 * app/api/strava/disconnect/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * POST /api/strava/disconnect
 *
 * Clears all Strava session cookies, effectively disconnecting the account.
 * Does NOT revoke the token on Strava's side (optional enhancement).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextResponse } from "next/server";
import { clearStravaSession } from "@/lib/stravaSession";

export async function POST(): Promise<NextResponse> {
  await clearStravaSession();
  return NextResponse.json({ disconnected: true });
}
