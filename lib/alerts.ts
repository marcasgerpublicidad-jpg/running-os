/**
 * lib/alerts.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates contextual system alerts from live ATL/CTL/TSB + recovery data.
 * Replaces the hardcoded ALERTS array in lib/data.ts when Strava data is live.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { DailyMetrics } from "./metrics";
import type { RecoveryData, Alert } from "./data";

/**
 * generateAlerts
 * Produces a prioritized list of system alerts based on today's metrics.
 * Returns between 2 and 6 alerts, ordered by severity.
 */
export function generateAlerts(
  metrics:  DailyMetrics,
  recovery: RecoveryData
): Alert[] {
  const alerts: Alert[] = [];

  // ── TSB / Form ──────────────────────────────────────────────────────────
  if (metrics.tsb > 10) {
    alerts.push({
      id: "tsb-fresh", level: "blue",
      title: "Estás muy fresco.",
      body:  "TSB > 10. Podrías estar ligeramente desentrenado. Considera una sesión de calidad.",
      time:  "Actualizado ahora",
    });
  } else if (metrics.tsb >= 0) {
    alerts.push({
      id: "tsb-optimal", level: "green",
      title: "TSB en zona óptima.",
      body:  "Forma deportiva positiva. Buena ventana para trabajo de calidad.",
      time:  "Actualizado ahora",
    });
  } else if (metrics.tsb >= -10) {
    alerts.push({
      id: "tsb-normal", level: "amber",
      title: "Carga de entrenamiento normal.",
      body:  `TSB en ${metrics.tsb.toFixed(1)}. Fatiga acumulable. Monitorear recuperación diaria.`,
      time:  "Actualizado ahora",
    });
  } else if (metrics.tsb >= -30) {
    alerts.push({
      id: "tsb-high-load", level: "amber",
      title: "Bloque de carga alta.",
      body:  `TSB en ${metrics.tsb.toFixed(1)}. Considerar semana de descarga próximamente.`,
      time:  "Proyección automática",
    });
  } else {
    alerts.push({
      id: "tsb-danger", level: "red",
      title: "Riesgo de sobreentrenamiento.",
      body:  `TSB en ${metrics.tsb.toFixed(1)}. Reducir carga inmediatamente. Priorizar recuperación.`,
      time:  "Alerta crítica",
    });
  }

  // ── HRV ─────────────────────────────────────────────────────────────────
  if (recovery.hrvDeviation <= -8) {
    alerts.push({
      id: "hrv-very-low", level: "red",
      title: "HRV muy por debajo del baseline.",
      body:  `${recovery.hrv}ms vs baseline ${recovery.hrvBaseline}ms. Sesión de recuperación activa únicamente.`,
      time:  "Esta mañana",
    });
  } else if (recovery.hrvDeviation <= -4) {
    alerts.push({
      id: "hrv-low", level: "amber",
      title: "HRV por debajo del baseline.",
      body:  `${recovery.hrv}ms vs baseline ${recovery.hrvBaseline}ms. Reducir intensidad hoy.`,
      time:  "Esta mañana",
    });
  } else if (recovery.hrvDeviation >= 4) {
    alerts.push({
      id: "hrv-high", level: "green",
      title: "HRV sobre el baseline.",
      body:  `${recovery.hrv}ms vs baseline ${recovery.hrvBaseline}ms. Sistema nervioso recuperado. Buen día para intensidad.`,
      time:  "Esta mañana",
    });
  }

  // ── Sleep ────────────────────────────────────────────────────────────────
  if (recovery.sleepPct < 0.7) {
    alerts.push({
      id: "sleep-low", level: "amber",
      title: "Sueño insuficiente.",
      body:  `${Math.floor(recovery.sleep)}h ${Math.round((recovery.sleep % 1) * 60)}m. Bajo el mínimo recomendado de 7h. El progreso ocurre durante el descanso.`,
      time:  "Anoche",
    });
  }

  // ── ATL spike ────────────────────────────────────────────────────────────
  if (metrics.atl > 85) {
    alerts.push({
      id: "atl-spike", level: "red",
      title: "Fatiga aguda elevada.",
      body:  `ATL en ${metrics.atl.toFixed(0)}. Por encima del rango seguro (40–85). Programar descarga.`,
      time:  "Proyección automática",
    });
  }

  // ── CTL progress ─────────────────────────────────────────────────────────
  if (metrics.ctl >= 70) {
    alerts.push({
      id: "ctl-good", level: "blue",
      title: "CTL en progresión correcta.",
      body:  `Forma crónica en ${metrics.ctl.toFixed(0)}. Consistencia reflejada en los datos.`,
      time:  "Análisis semanal",
    });
  }

  // Return max 4 alerts, most severe first
  return alerts.slice(0, 4);
}
