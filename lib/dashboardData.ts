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

export type DataSource = "strava" | "not_connected" | "fallback";
export type TrainingDataReason =
  | "connected"
  | "not_connected"
  | "token_invalid"
  | "upstream_error";

export interface DashboardMetrics {
  pmcSeries:     DailyMetrics[];
  todayMetrics:  DailyMetrics;
  trainingDays:  TrainingDay[];
  activities:    Activity[];          // empty array when using demo data
  source:        DataSource;
  reason: TrainingDataReason;
  fallbackActive: boolean;
  message: string | null;
  connectionStatus: TrainingDataReason;
  athleteName?:  string;              // populated from Strava profile if connected
}

function buildFallbackMetrics(
  source: Exclude<DataSource, "strava">,
  reason: Exclude<TrainingDataReason, "connected">,
  message: string
): DashboardMetrics {
  return {
    pmcSeries: PMC_SERIES,
    todayMetrics: TODAY_METRICS,
    trainingDays: TRAINING_HISTORY,
    activities: [],
    source,
    reason,
    fallbackActive: true,
    message,
    connectionStatus: reason,
  };
}

export interface TrainingDataApiPayload {
  source: DataSource;
  reason: TrainingDataReason;
  message: string | null;
  fallbackActive: boolean;
  connectionStatus: TrainingDataReason;
  activities: Activity[];
  trainingDays: TrainingDay[];
  pmc: DailyMetrics[];
  today: DailyMetrics;
  meta: {
    activitiesCount: number;
    fetchedAt: string;
  };
}

export function toTrainingDataApiPayload(data: DashboardMetrics): TrainingDataApiPayload {
  return {
    source: data.source,
    reason: data.reason,
    message: data.message,
    fallbackActive: data.fallbackActive,
    connectionStatus: data.connectionStatus,
    activities: data.activities,
    trainingDays: data.trainingDays,
    pmc: data.pmcSeries,
    today: data.todayMetrics,
    meta: {
      activitiesCount: data.activities.length,
      fetchedAt: new Date().toISOString(),
    },
  };
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

    if (!accessToken) {
      return buildFallbackMetrics(
        "not_connected",
        "not_connected",
        "Strava sin conexion. Fallback activo para mantener el dashboard operativo."
      );
    }

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
      reason: "connected",
      fallbackActive: false,
      message: null,
      connectionStatus: "connected",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    if (message === "STRAVA_UNAUTHORIZED") {
      return buildFallbackMetrics(
        "not_connected",
        "token_invalid",
        "Token de Strava invalido o vencido. Reconecta para volver a datos reales."
      );
    }

    console.warn("[dashboardData] Strava fetch failed, using fallback data:", err);
    return buildFallbackMetrics(
      "fallback",
      "upstream_error",
      "No pudimos sincronizar Strava. Fallback activo hasta recuperar la conexion."
    );
  }
}
