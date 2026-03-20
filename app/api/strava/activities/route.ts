/**
 * app/api/strava/activities/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * GET /api/strava/activities
 *
 * Fetches the athlete's Strava activities, normalizes them, and returns
 * the data the dashboard needs: activities + computed PMC series.
 *
 * Query params:
 *   ?days=90      — how many trailing days to fetch (default: 90)
 *   ?raw=true     — include raw Strava activities in response (default: false)
 *
 * Response shape:
 * {
 *   activities:  Activity[]        — normalized, oldest first
 *   trainingDays: TrainingDay[]    — daily TSS, ready for buildMetricSeries()
 *   pmc:         DailyMetrics[]    — computed ATL/CTL/TSB series
 *   today:       DailyMetrics      — latest snapshot
 *   source:      "strava" | "demo" — data source indicator
 * }
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { getDashboardMetrics, toTrainingDataApiPayload } from "@/lib/dashboardData";

export const dynamic = "force-dynamic"; // Never cache — always fresh data

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const showRaw = searchParams.get("raw") === "true";
  const data = await getDashboardMetrics();
  const payload = toTrainingDataApiPayload(data);

  return NextResponse.json({
    ...payload,
    ...(showRaw ? { raw: [] } : {}),
  });
}
