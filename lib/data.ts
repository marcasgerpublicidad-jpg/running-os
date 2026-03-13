/**
 * lib/data.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Placeholder data for the Running OS dashboard prototype.
 * In production, replace with real API calls or database queries.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { buildMetricSeries, type DailyMetrics, type TrainingDay } from "./metrics";

// ─── Athlete ─────────────────────────────────────────────────────────────────

export interface Athlete {
  id: string;
  name: string;
  initials: string;
  goal: string;
  currentCycle: string;
  currentWeek: number;
  totalWeeks: number;
}

export const ATHLETE: Athlete = {
  id:           "marcos-ruiz",
  name:         "Marcos Ruiz",
  initials:     "MR",
  goal:         "Sub-4h · Maratón",
  currentCycle: "Ciclo base",
  currentWeek:  8,
  totalWeeks:   16,
};

// ─── 42-day training history (seeds the PMC) ─────────────────────────────────

export const TRAINING_HISTORY: TrainingDay[] = [
  { date: "2026-01-28", tss: 55 }, { date: "2026-01-29", tss: 70 },
  { date: "2026-01-30", tss: 0  }, { date: "2026-01-31", tss: 85 },
  { date: "2026-02-01", tss: 45 }, { date: "2026-02-02", tss: 90 },
  { date: "2026-02-03", tss: 0  }, { date: "2026-02-04", tss: 60 },
  { date: "2026-02-05", tss: 75 }, { date: "2026-02-06", tss: 0  },
  { date: "2026-02-07", tss: 80 }, { date: "2026-02-08", tss: 50 },
  { date: "2026-02-09", tss: 95 }, { date: "2026-02-10", tss: 0  },
  { date: "2026-02-11", tss: 65 }, { date: "2026-02-12", tss: 72 },
  { date: "2026-02-13", tss: 0  }, { date: "2026-02-14", tss: 88 },
  { date: "2026-02-15", tss: 42 }, { date: "2026-02-16", tss: 92 },
  { date: "2026-02-17", tss: 0  }, { date: "2026-02-18", tss: 68 },
  { date: "2026-02-19", tss: 78 }, { date: "2026-02-20", tss: 0  },
  { date: "2026-02-21", tss: 82 }, { date: "2026-02-22", tss: 55 },
  { date: "2026-02-23", tss: 98 }, { date: "2026-02-24", tss: 0  },
  { date: "2026-02-25", tss: 62 }, { date: "2026-02-26", tss: 75 },
  { date: "2026-02-27", tss: 30 }, { date: "2026-02-28", tss: 85 },
  { date: "2026-03-01", tss: 48 }, { date: "2026-03-02", tss: 88 },
  { date: "2026-03-03", tss: 0  }, { date: "2026-03-04", tss: 70 },
  { date: "2026-03-05", tss: 80 }, { date: "2026-03-06", tss: 0  },
  { date: "2026-03-07", tss: 90 }, { date: "2026-03-08", tss: 55 },
  { date: "2026-03-09", tss: 95 }, { date: "2026-03-10", tss: 0  },
];

/** Full computed PMC series. */
export const PMC_SERIES: DailyMetrics[] = buildMetricSeries(
  TRAINING_HISTORY,
  48, // seed ATL — approximate starting fitness
  52  // seed CTL
);

/** Today's snapshot (last entry). */
export const TODAY_METRICS: DailyMetrics = PMC_SERIES[PMC_SERIES.length - 1];

// ─── Recovery ────────────────────────────────────────────────────────────────

export interface RecoveryData {
  score:          number;  // 0–100 composite recovery score
  sleep:          number;  // hours
  sleepPct:       number;  // 0–1 relative to personal optimal (8h)
  hrv:            number;  // ms
  hrvBaseline:    number;  // ms
  hrvDeviation:   number;  // today − baseline
  hrvPct:         number;  // relative score 0–1
  restingHR:      number;  // bpm
  restingHRPct:   number;  // 0–1 (higher = closer to optimal low)
  muscleStatus:   "Bueno" | "Moderado" | "Pesado";
  musclePct:      number;  // 0–1
}

export const RECOVERY: RecoveryData = {
  score:        75,
  sleep:        7.33,   // 7h 20m
  sleepPct:     0.82,
  hrv:          58,
  hrvBaseline:  62,
  hrvDeviation: -4,
  hrvPct:       0.68,
  restingHR:    44,
  restingHRPct: 0.88,
  muscleStatus: "Moderado",
  musclePct:    0.60,
};

// ─── Weekly Plan ─────────────────────────────────────────────────────────────

export type SessionType = "Umbral" | "Recuperación" | "Largo" | "Descanso" | "Tempo" | "Rodaje" | "Series";

export interface DayPlan {
  day:      string;  // short label
  type:     SessionType;
  tss:      number;
  pct:      number;  // relative to week's peak (0–1)
  color:    string;  // tailwind class suffix or hex
  isToday:  boolean;
  done:     boolean;
}

export const WEEKLY_PLAN: DayPlan[] = [
  { day: "LUN", type: "Umbral",       tss: 72, pct: 0.80, color: "#60A5FA", isToday: true,  done: false },
  { day: "MAR", type: "Recuperación", tss: 30, pct: 0.33, color: "#4ADE80", isToday: false, done: false },
  { day: "MIÉ", type: "Largo",        tss: 90, pct: 1.00, color: "#F87171", isToday: false, done: false },
  { day: "JUE", type: "Descanso",     tss: 0,  pct: 0.00, color: "#383838", isToday: false, done: false },
  { day: "VIE", type: "Tempo",        tss: 65, pct: 0.72, color: "#FBBF24", isToday: false, done: false },
  { day: "SÁB", type: "Rodaje",       tss: 55, pct: 0.61, color: "#60A5FA", isToday: false, done: false },
  { day: "DOM", type: "Descanso",     tss: 0,  pct: 0.00, color: "#383838", isToday: false, done: false },
];

// ─── Alerts ──────────────────────────────────────────────────────────────────

export type AlertLevel = "green" | "amber" | "red" | "blue";

export interface Alert {
  id:      string;
  level:   AlertLevel;
  title:   string;
  body:    string;
  time:    string;
}

export const ALERTS: Alert[] = [
  {
    id:    "tsb-ok",
    level: "green",
    title: "TSB en zona óptima.",
    body:  "Forma deportiva positiva. Buena ventana para trabajo de calidad.",
    time:  "Actualizado hace 2h",
  },
  {
    id:    "hrv-low",
    level: "amber",
    title: "HRV por debajo del baseline.",
    body:  "Considerar reducir intensidad hoy. Priorizar recuperación activa.",
    time:  "Esta mañana · 06:40",
  },
  {
    id:    "ctl-progress",
    level: "blue",
    title: "CTL en progresión correcta.",
    body:  "+2 puntos en 4 semanas. En línea con el plan de base.",
    time:  "Análisis semanal",
  },
  {
    id:    "atl-high",
    level: "red",
    title: "Semana de carga alta.",
    body:  "ATL alcanzó 68. Programar semana de descarga en D+5.",
    time:  "Proyección automática",
  },
];

// ─── Next Session ─────────────────────────────────────────────────────────────

export interface NextSession {
  type:        string;
  duration:    string;
  distance:    string;
  hrZone:      string;
  targetPace:  string;
  estimatedTSS: number;
}

export const NEXT_SESSION: NextSession = {
  type:         "Umbral Lactato",
  duration:     "70 min",
  distance:     "13–14 km",
  hrZone:       "Z3–Z4",
  targetPace:   "5:05–5:20 /km",
  estimatedTSS: 72,
};
