import type { AthleteContext } from "./athleteContextShared";
import type { DayPlan } from "./data";
import type { DailyMetrics } from "./metrics";
import type { DataSource } from "./dashboardData";

type Signal = "green" | "amber" | "red";

export type RecoveryUrgency = "low" | "medium" | "high";

export interface PostSessionRecovery {
  suggested: boolean;
  durationMin: number;
  focusAreas: string;
  urgency: RecoveryUrgency;
  reason: string;
}

const NO_RECOVERY: PostSessionRecovery = {
  suggested: false,
  durationMin: 0,
  focusAreas: "Sin bloque de descarga específico.",
  urgency: "low",
  reason: "No hace falta una descarga post-sesión relevante hoy.",
};

function adjustWithContext(
  base: PostSessionRecovery,
  athleteContext: AthleteContext | null,
  readinessSignal: Signal,
  source: DataSource,
  todayMetrics: DailyMetrics | null
): PostSessionRecovery {
  let focusAreas = base.focusAreas;
  let reason = base.reason;
  let durationMin = base.durationMin;
  let urgency = base.urgency;

  if (athleteContext?.surfaceContext.includes("trail")) {
    focusAreas = `${focusAreas} Sumá tobillo, planta del pie y cadera por contexto trail.`;
  } else if (athleteContext?.surfaceContext.includes("cinta")) {
    focusAreas = `${focusAreas} Sumá gemelos y flexores de cadera por trabajo en cinta.`;
  }

  if (athleteContext?.toleranceProfile === "tolera-volumen") {
    reason = `${reason} Priorizá descargar cadena posterior para sostener volumen sin arrastrar fatiga.`;
  } else if (athleteContext?.toleranceProfile === "tolera-intensidad") {
    reason = `${reason} La descarga apunta a bajar tensión neuromuscular después del estímulo.`;
  }

  if (readinessSignal === "red") {
    durationMin += 2;
    urgency = "high";
    reason = `${reason} El readiness bajo aumenta la prioridad de recuperación hoy.`;
  } else if (readinessSignal === "amber" && urgency === "low") {
    urgency = "medium";
  }

  if (source === "strava" && todayMetrics && (todayMetrics.tsb <= -15 || todayMetrics.atl >= 75)) {
    durationMin += 1;
    urgency = "high";
    reason = `${reason} La carga reciente sugiere descargar mejor para no acumular tensión residual.`;
  }

  return {
    ...base,
    durationMin,
    urgency,
    focusAreas,
    reason,
  };
}

export function buildPostSessionRecovery(params: {
  todayPlan: DayPlan | null;
  athleteContext?: AthleteContext | null;
  readinessSignal: Signal;
  source?: DataSource;
  todayMetrics?: DailyMetrics | null;
}): PostSessionRecovery {
  const {
    todayPlan,
    athleteContext = null,
    readinessSignal,
    source = "fallback",
    todayMetrics = null,
  } = params;

  if (!todayPlan || todayPlan.type === "Descanso") {
    return NO_RECOVERY;
  }

  let base: PostSessionRecovery;

  switch (todayPlan.type) {
    case "Recuperación":
    case "Rodaje":
      base = {
        suggested: true,
        durationMin: 4,
        focusAreas: "Gemelos, tobillo y cadera con movilidad suave.",
        urgency: "low",
        reason: "Después de una sesión liviana alcanza con una descarga breve para soltar sin convertirlo en un ritual largo.",
      };
      break;
    case "Tempo":
    case "Umbral":
    case "Series":
      base = {
        suggested: true,
        durationMin: 9,
        focusAreas: "Gemelos, isquios, glúteos y flexores de cadera.",
        urgency: "high",
        reason: "La sesión de calidad deja más tensión neuromuscular y conviene bajar carga residual apenas terminás.",
      };
      break;
    case "Largo":
      base = {
        suggested: true,
        durationMin: 11,
        focusAreas: "Cadena posterior, pies, cadera y zona lumbar baja.",
        urgency: "high",
        reason: "El volumen largo pide una descarga más seria para llegar mejor a la próxima sesión sin rigidez acumulada.",
      };
      break;
    default:
      base = {
        suggested: true,
        durationMin: 7,
        focusAreas: "Cadera, cadena posterior y movilidad general.",
        urgency: "medium",
        reason: "Conviene cerrar la sesión con una descarga breve para que el estímulo no se traduzca en rigidez innecesaria.",
      };
      break;
  }

  return adjustWithContext(base, athleteContext, readinessSignal, source, todayMetrics);
}
