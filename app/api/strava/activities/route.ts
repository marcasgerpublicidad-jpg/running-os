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
import {
  fetchStravaActivitiesLast90Days,
  fetchStravaActivities,
  normalizeActivities,
  activitiesToTrainingDays,
} from "@/lib/strava";
import { buildMetricSeries } from "@/lib/metrics";
import { getValidAccessToken } from "@/lib/stravaSession";

export const dynamic = "force-dynamic"; // Never cache — always fresh data

export async function GET(request: NextRequest): Promise<NextResponse> {
  // ── Auth check ─────────────────────────────────────────────────────────────
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    return NextResponse.json(
      { error: "NOT_CONNECTED", message: "Strava account not connected." },
      { status: 401 }
    );
  }

  // ── Parse query params ─────────────────────────────────────────────────────
  const { searchParams } = request.nextUrl;
  const days    = parseInt(searchParams.get("days") ?? "90", 10);
  const showRaw = searchParams.get("raw") === "true";

  try {
    // ── Fetch from Strava ───────────────────────────────────────────────────
    let rawActivities;

    if (days <= 90) {
      rawActivities = await fetchStravaActivitiesLast90Days(accessToken);
    } else {
      // Custom window
      const after = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;
      rawActivities = await fetchStravaActivities(accessToken, {
        after,
        perPage: 200,
      });
    }

    // ── Normalize ───────────────────────────────────────────────────────────
    const activities   = normalizeActivities(rawActivities);
    const trainingDays = activitiesToTrainingDays(activities);

    // ── Compute PMC ─────────────────────────────────────────────────────────
    // Seed ATL/CTL from 0 — for a production system, store the athlete's
    // last known values in your database and pass them as seeds here.
    const pmc   = buildMetricSeries(trainingDays, 0, 0);
    const today = pmc[pmc.length - 1];

    // ── Response ────────────────────────────────────────────────────────────
    return NextResponse.json({
      activities,
      trainingDays,
      pmc,
      today,
      source: "strava",
      meta: {
        activitiesCount: activities.length,
        daysWindow:      days,
        fetchedAt:       new Date().toISOString(),
      },
      ...(showRaw ? { raw: rawActivities } : {}),
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    // Strava rate limit: 100 requests per 15 minutes, 1000 per day
    if (message.includes("429")) {
      return NextResponse.json(
        { error: "RATE_LIMITED", message: "Strava API rate limit reached. Try again shortly." },
        { status: 429 }
      );
    }

    console.error("[/api/strava/activities] Error:", message);
    return NextResponse.json(
      { error: "FETCH_ERROR", message },
      { status: 500 }
    );
  }
}
