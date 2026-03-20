import type { AthleteContext } from "./athleteContextShared";
import type { DayPlan } from "./data";

type Signal = "green" | "amber" | "red";

export type ActivationBlockType =
  | "off"
  | "mobility-light"
  | "dynamic-primer"
  | "neuromuscular-primer"
  | "stability-primer"
  | "long-run-primer";

export interface PreSessionActivation {
  recommended: boolean;
  durationMin: number;
  focus: string;
  objective: string;
  blockType: ActivationBlockType;
}

const DEFAULT_ACTIVATION: PreSessionActivation = {
  recommended: false,
  durationMin: 0,
  focus: "Sin activación específica.",
  objective: "No hace falta bloque previo adicional hoy.",
  blockType: "off",
};

function includesStyle(context: AthleteContext | null, style: string): boolean {
  return !!context?.preferredSessionStyles.includes(style as never);
}

function includesSurface(context: AthleteContext | null, surface: string): boolean {
  return !!context?.surfaceContext.includes(surface as never);
}

function withContext(base: PreSessionActivation, context: AthleteContext | null, readinessSignal: Signal): PreSessionActivation {
  let focus = base.focus;
  let objective = base.objective;

  if (includesSurface(context, "trail")) {
    focus = `${focus} Tobillo, cadera y core primero por contexto trail.`;
  } else if (includesSurface(context, "cinta")) {
    focus = `${focus} Sumá movilidad de cadera y tobillo para entrar suelto en cinta.`;
  }

  if (includesStyle(context, "cuestas")) {
    objective = `${objective} Prepará cadena posterior y apoyo para cambios de pendiente.`;
  } else if (includesStyle(context, "steady") || includesStyle(context, "continuo")) {
    objective = `${objective} Buscá entrar estable al ritmo sin picos bruscos al inicio.`;
  }

  if (context?.toleranceProfile === "necesita-continuidad") {
    objective = `${objective} Evitá cortes bruscos y entrá progresivo al estímulo.`;
  }

  if (readinessSignal === "red" && base.recommended) {
    return {
      ...base,
      durationMin: Math.max(4, Math.min(base.durationMin, 6)),
      focus,
      objective: `${objective} Mantenela corta para no gastar energía antes de salir.`,
      blockType: base.blockType === "neuromuscular-primer" ? "dynamic-primer" : base.blockType,
    };
  }

  if (readinessSignal === "amber" && base.recommended && base.durationMin >= 10) {
    return {
      ...base,
      durationMin: base.durationMin - 1,
      focus,
      objective,
    };
  }

  return {
    ...base,
    focus,
    objective,
  };
}

export function buildPreSessionActivation(params: {
  todayPlan: DayPlan | null;
  readinessSignal: Signal;
  athleteContext?: AthleteContext | null;
}): PreSessionActivation {
  const { todayPlan, readinessSignal, athleteContext = null } = params;

  if (!todayPlan || todayPlan.type === "Descanso") {
    return DEFAULT_ACTIVATION;
  }

  let base: PreSessionActivation;

  switch (todayPlan.type) {
    case "Recuperación":
    case "Rodaje":
      base = {
        recommended: true,
        durationMin: 5,
        focus: "Movilidad ligera de tobillo, cadera y respiración.",
        objective: "Entrar en calor sin elevar de más la carga antes del rodaje.",
        blockType: "mobility-light",
      };
      break;
    case "Tempo":
    case "Umbral":
    case "Series":
      base = {
        recommended: true,
        durationMin: 10,
        focus: "Movilidad dinámica + activación neuromuscular de cadera, tobillo y glúteos.",
        objective: "Preparar mecánica, ritmo y reclutamiento antes del bloque de calidad.",
        blockType: "neuromuscular-primer",
      };
      break;
    case "Largo":
      base = {
        recommended: true,
        durationMin: 6,
        focus: "Movilidad breve de cadera, tobillo y cadena posterior.",
        objective: "Soltar el cuerpo para empezar fluido sin fatigarte antes del volumen largo.",
        blockType: "long-run-primer",
      };
      break;
    default:
      base = {
        recommended: true,
        durationMin: 8,
        focus: "Movilidad dinámica general y estabilidad de core.",
        objective: "Preparar articulaciones y control antes de la sesión.",
        blockType: "dynamic-primer",
      };
      break;
  }

  return withContext(base, athleteContext, readinessSignal);
}
