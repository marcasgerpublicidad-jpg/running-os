/**
 * lib/dashboardData.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified data resolver for the Running OS dashboard.
 *
 * Priority:
 *   1. Strava (if connected and fetch succeeds)
 *   2. Demo data (TRAINING_HISTORY from lib/data.ts)
 *
 * This module is imported by app/dashboard/page.tsx (Server Component),
 * so all fetching happens server-side — no API keys exposed to the client.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { buildMetricSeries, type DailyMetrics } from "./metrics";
import type { TrainingDay } from "./metrics";
import type { Activity } from "./strava";
import {
  activitiesToTrainingDays,
  fetchStravaActivitiesLast90Days,
  normalizeActivities,
} from "./strava";
import { getValidAccessToken } from "./stravaSession";
import { TRAINING_HISTORY, PMC_SERIES, TODAY_METRICS } from "./data";

export type DataSource = "strava" | "demo";

export interface DashboardMetrics {
  pmcSeries:     DailyMetrics[];
  todayMetrics:  DailyMetrics;
  trainingDays:  TrainingDay[];
  activities:    Activity[];          // empty array when using demo data
  source:        DataSource;
  athleteName?:  string;              // populated from Strava profile if connected
}

/**
 * getDashboardMetrics
 * ─────────────────────────────────────────────────────────────────────────────
 * Server-side data fetcher for the dashboard.
 * Tries Strava first; gracefully falls back to demo data on any failure.
 *
 * Call this from a Server Component or a server action.
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  // ── Attempt Strava ────────────────────────────────────────────────────────
  try {
    const accessToken = await getValidAccessToken();

    if (accessToken) {
      const rawActivities = await fetchStravaActivitiesLast90Days(accessToken);
      const activities    = normalizeActivities(rawActivities);
      const trainingDays  = activitiesToTrainingDays(activities);
      const pmcSeries     = buildMetricSeries(trainingDays, 0, 0);
      const todayMetrics  = pmcSeries[pmcSeries.length - 1];

      return {
        pmcSeries,
        todayMetrics,
        trainingDays,
        activities,
        source: "strava",
      };
    }
  } catch (err) {
    // Log but don't crash — fall through to demo data
    console.warn("[dashboardData] Strava fetch failed, using demo data:", err);
  }

  // ── Fallback: demo data ───────────────────────────────────────────────────
  return {
    pmcSeries:    PMC_SERIES,
    todayMetrics: TODAY_METRICS,
    trainingDays: TRAINING_HISTORY,
    activities:   [],
    source:       "demo",
  };
}
