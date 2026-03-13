/**
 * lib/metrics.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Core performance metric calculations for Running OS.
 *
 * Based on the Performance Management Chart (PMC) model developed by
 * Dr. Andrew Coggan and used in platforms like TrainingPeaks.
 *
 * All calculations use exponential moving averages (EMA), which give
 * more weight to recent data — matching how the body actually responds
 * to training load over time.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** A single day's training record. TSS = Training Stress Score. */
export interface TrainingDay {
  date: string; // ISO date string e.g. "2026-03-10"
  tss: number;  // Training Stress Score for that day (0 = rest)
}

/** Computed daily metrics snapshot. */
export interface DailyMetrics {
  date: string;
  tss: number;
  atl: number; // Acute Training Load  (fatigue)
  ctl: number; // Chronic Training Load (fitness)
  tsb: number; // Training Stress Balance (form)
}

// ─── EMA decay factors ──────────────────────────────────────────────────────
//
// The time constant (τ) defines how fast older data decays.
// ATL uses 7 days  → fast response → tracks short-term fatigue.
// CTL uses 42 days → slow response → tracks long-term fitness.
//
// Decay factor k = 1 − (1 / τ)
// This means yesterday's value contributes (k × 100)% to today's value.

const ATL_TAU = 7;   // days
const CTL_TAU = 42;  // days

const ATL_K = 1 - 1 / ATL_TAU;  // ≈ 0.857
const CTL_K = 1 - 1 / CTL_TAU;  // ≈ 0.976

/**
 * calculateATL
 * ─────────────────────────────────────────────────────────────────────────────
 * Acute Training Load — 7-day exponential moving average of TSS.
 *
 * Represents SHORT-TERM fatigue. Rises quickly with hard training,
 * drops quickly during rest. High ATL → tired athlete.
 *
 * Formula: ATL_today = ATL_yesterday × k_atl + TSS_today × (1 − k_atl)
 *
 * @param tssHistory - Array of daily TSS values, oldest first.
 * @param seed - Starting ATL value (default 0).
 */
export function calculateATL(tssHistory: number[], seed = 0): number[] {
  const result: number[] = [];
  let prev = seed;

  for (const tss of tssHistory) {
    const current = prev * ATL_K + tss * (1 - ATL_K);
    result.push(Math.round(current * 10) / 10);
    prev = current;
  }

  return result;
}

/**
 * calculateCTL
 * ─────────────────────────────────────────────────────────────────────────────
 * Chronic Training Load — 42-day exponential moving average of TSS.
 *
 * Represents LONG-TERM fitness. Rises slowly with consistent training,
 * drops slowly during rest or injury. High CTL → fit athlete.
 *
 * Formula: CTL_today = CTL_yesterday × k_ctl + TSS_today × (1 − k_ctl)
 *
 * @param tssHistory - Array of daily TSS values, oldest first.
 * @param seed - Starting CTL value (default 0).
 */
export function calculateCTL(tssHistory: number[], seed = 0): number[] {
  const result: number[] = [];
  let prev = seed;

  for (const tss of tssHistory) {
    const current = prev * CTL_K + tss * (1 - CTL_K);
    result.push(Math.round(current * 10) / 10);
    prev = current;
  }

  return result;
}

/**
 * calculateTSB
 * ─────────────────────────────────────────────────────────────────────────────
 * Training Stress Balance — the difference between fitness and fatigue.
 *
 * TSB = CTL − ATL
 *
 * Interpretation:
 *   TSB > +10  → Very fresh, possibly detrained. Risk: underperformance.
 *   TSB 0–+10  → Optimal race/competition window. Peak form.
 *   TSB −10–0  → Normal training zone. Slight fatigue, building fitness.
 *   TSB < −10  → Heavy training block. Risk: overreaching if sustained.
 *   TSB < −30  → Danger zone. High injury and overtraining risk.
 *
 * @param ctlSeries - Array of CTL values.
 * @param atlSeries - Array of ATL values (must be same length).
 */
export function calculateTSB(ctlSeries: number[], atlSeries: number[]): number[] {
  return ctlSeries.map((ctl, i) =>
    Math.round((ctl - atlSeries[i]) * 10) / 10
  );
}

/**
 * buildMetricSeries
 * ─────────────────────────────────────────────────────────────────────────────
 * Convenience function: given a list of TrainingDay records, compute
 * the full ATL / CTL / TSB series in one pass.
 *
 * @param days - Training history, oldest first.
 * @param seedAtl - Initial ATL (use last known value for continuations).
 * @param seedCtl - Initial CTL (use last known value for continuations).
 */
export function buildMetricSeries(
  days: TrainingDay[],
  seedAtl = 0,
  seedCtl = 0
): DailyMetrics[] {
  const tssValues = days.map((d) => d.tss);
  const atlSeries = calculateATL(tssValues, seedAtl);
  const ctlSeries = calculateCTL(tssValues, seedCtl);
  const tsbSeries = calculateTSB(ctlSeries, atlSeries);

  return days.map((day, i) => ({
    date: day.date,
    tss:  day.tss,
    atl:  atlSeries[i],
    ctl:  ctlSeries[i],
    tsb:  tsbSeries[i],
  }));
}

/**
 * getTSBStatus
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns a human-readable form status and a semantic color token.
 */
export function getTSBStatus(tsb: number): {
  label: string;
  color: "green" | "amber" | "red" | "blue";
} {
  if (tsb > 10)   return { label: "Muy fresco",         color: "blue"  };
  if (tsb >= 0)   return { label: "Zona óptima",        color: "green" };
  if (tsb >= -10) return { label: "Carga normal",       color: "amber" };
  if (tsb >= -30) return { label: "Bloque de carga",    color: "amber" };
  return              { label: "Riesgo sobreentrenamiento", color: "red" };
}

/**
 * calculateTSS
 * ─────────────────────────────────────────────────────────────────────────────
 * Public TSS calculator — accepts a normalized Activity and returns the
 * estimated Training Stress Score.
 *
 * This is the public API surface used by consumers (components, routes).
 * The detailed implementation lives in lib/strava.ts as calculateTSSFromActivity.
 *
 * TSS = duration_hours × intensity_factor² × 100
 *
 * intensity_factor is derived from:
 *   1. Heart rate (preferred): IF = avg_hr / lthr  (lthr default: 165 bpm)
 *   2. Pace (fallback):        IF = threshold_pace / actual_pace
 *
 * Reference values:
 *   Easy 1h run  (IF 0.70) → TSS  49
 *   Tempo 1h run (IF 0.90) → TSS  81
 *   Race effort  (IF 1.05) → TSS 110
 *
 * @param activity - A normalized Activity object (from lib/strava.ts).
 * @param thresholdPaceMinPerKm - Athlete's threshold pace in min/km. Default: 5.0.
 * @param lthrBpm               - Lactate threshold HR in bpm.        Default: 165.
 */
export function calculateTSS(
  activity: {
    moving_time:       number;  // seconds
    average_pace:      number;  // min/km
    average_heartrate?: number; // bpm (optional)
  },
  thresholdPaceMinPerKm = 5.0,
  lthrBpm = 165
): number {
  const movingTimeHours = activity.moving_time / 3600;

  let intensityFactor: number;

  if (activity.average_heartrate && activity.average_heartrate > 0) {
    intensityFactor = activity.average_heartrate / lthrBpm;
  } else if (activity.average_pace > 0) {
    intensityFactor = thresholdPaceMinPerKm / activity.average_pace;
  } else {
    intensityFactor = 0.7;
  }

  // Clamp to physiological range
  intensityFactor = Math.min(Math.max(intensityFactor, 0.3), 1.3);

  const tss = movingTimeHours * Math.pow(intensityFactor, 2) * 100;
  return Math.round(tss * 10) / 10;
}

/**
 * getReadinessStatus
 * ─────────────────────────────────────────────────────────────────────────────
 * Combines TSB + HRV deviation to determine daily training readiness.
 * Returns a semáforo signal: green / amber / red.
 *
 * @param tsb - Current TSB value.
 * @param hrvDeviation - Difference between today's HRV and personal baseline (ms).
 *                       Negative = below baseline (worse recovery).
 */
export function getReadinessStatus(
  tsb: number,
  hrvDeviation: number
): { signal: "green" | "amber" | "red"; label: string } {
  const tsbOk  = tsb >= -15;
  const hrvOk  = hrvDeviation >= -5;

  if (tsbOk && hrvOk)   return { signal: "green", label: "Apto para entrenar"    };
  if (tsbOk || hrvOk)   return { signal: "amber", label: "Entrenar con precaución" };
  return                       { signal: "red",   label: "Recuperación prioritaria" };
}
