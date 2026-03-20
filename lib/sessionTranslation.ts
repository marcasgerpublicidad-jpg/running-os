import type { NextSession, DayPlan } from "./data";
import type { AthleteContext } from "./athleteContextShared";
import type { PlanningHorizon } from "./planningHorizon";

export interface SessionTranslationResult {
  session: NextSession;
  note: string;
  label: string;
}

function isQualitySession(type: DayPlan["type"]): boolean {
  return type === "Umbral" || type === "Tempo" || type === "Series";
}

function buildExecutionTarget(
  executionPreference: AthleteContext["executionPreference"],
  fallback: string,
  options: {
    zones: string;
    sensations: string;
    pace: string;
    mixed: string;
  }
): string {
  switch (executionPreference) {
    case "zonas":
      return options.zones;
    case "sensaciones":
      return options.sensations;
    case "ritmo":
      return options.pace;
    default:
      return options.mixed || fallback;
  }
}

export function translateSessionStimulus(params: {
  baseSession: NextSession;
  todayPlan: DayPlan;
  athleteContext: AthleteContext | null;
  planningHorizon: PlanningHorizon;
}): SessionTranslationResult {
  const { baseSession, todayPlan, athleteContext, planningHorizon } = params;

  if (!athleteContext?.isConfigured) {
    return {
      session: baseSession,
      label: baseSession.type,
      note: "La traducción del estímulo todavía usa la forma base porque no hay perfil suficiente cargado.",
    };
  }

  const translated: NextSession = { ...baseSession };
  const notes: string[] = [];

  if (todayPlan.type === "Descanso") {
    translated.type = "Descanso total";
    return {
      session: translated,
      label: translated.type,
      note: "Hoy no corresponde traducir el estímulo: la prioridad es descanso y recuperación.",
    };
  }

  if (todayPlan.type === "Recuperación") {
    translated.type = athleteContext.executionPreference === "zonas"
      ? "Rodaje regenerativo por zonas"
      : "Rodaje regenerativo controlado";
    translated.hrZone = athleteContext.executionPreference === "zonas" ? "Z1–Z2" : translated.hrZone;
    translated.targetPace = buildExecutionTarget(athleteContext.executionPreference, translated.targetPace, {
      zones: "Z1–Z2 estable",
      sensations: "Muy suave, soltando piernas",
      pace: "Ritmo muy controlado",
      mixed: "Conversacional y estable",
    });
    notes.push("La sesión se mantiene regenerativa y la ejecución se ordena según tu preferencia principal.");
  }

  if (todayPlan.type === "Rodaje") {
    translated.type = athleteContext.executionPreference === "zonas"
      ? "Rodaje aeróbico por zonas"
      : athleteContext.executionPreference === "sensaciones"
        ? "Rodaje por sensaciones"
        : "Rodaje aeróbico controlado";
    translated.targetPace = buildExecutionTarget(athleteContext.executionPreference, translated.targetPace, {
      zones: "Z2 estable",
      sensations: "Cómodo y sostenible",
      pace: "Ritmo aeróbico sostenido",
      mixed: "Aeróbico, sin forzar",
    });
    notes.push("El estímulo aeróbico de hoy se expresa en un formato más alineado con tu forma de ejecutar.");
  }

  if (todayPlan.type === "Largo") {
    translated.type = athleteContext.monthlyLongRunRule ? "Fondo estructural" : "Largo aeróbico";
    translated.hrZone = athleteContext.executionPreference === "zonas" ? "Z2 estable" : translated.hrZone;
    translated.targetPace = buildExecutionTarget(athleteContext.executionPreference, translated.targetPace, {
      zones: "Z2 pareja, sin salirte",
      sensations: "Controlado al inicio, sólido al final",
      pace: "Ritmo de fondo estable",
      mixed: "Construcción sostenida y sin picos",
    });
    notes.push(
      athleteContext.monthlyLongRunRule
        ? "Como marcaste un fondo estructural mensual, el sistema lo trata como ancla de construcción."
        : "El largo se mantiene como estímulo de base, con ejecución más ordenada por tu perfil."
    );
  }

  if (isQualitySession(todayPlan.type)) {
    if (athleteContext.preferredQualityStyle === "steady-z2-progresivos") {
      translated.type = planningHorizon.phase === "especifica" || planningHorizon.phase === "afinacion"
        ? "Progresivo específico"
        : "Steady progresivo";
      translated.hrZone = "Z2–Z3";
      translated.targetPace = buildExecutionTarget(athleteContext.executionPreference, translated.targetPace, {
        zones: "Subir por zonas, sin cortes clásicos",
        sensations: "De controlado a firme, sin quiebres",
        pace: "Progresivo continuo",
        mixed: "Continuo, de menos a más",
      });
      notes.push("La calidad se traduce a un formato continuo porque priorizás steady, Z2 o progresivos.");
    } else if (athleteContext.preferredQualityStyle === "tempo-controlado") {
      translated.type = "Tempo continuo controlado";
      translated.hrZone = "Z3–Z4";
      translated.targetPace = buildExecutionTarget(athleteContext.executionPreference, translated.targetPace, {
        zones: "Tempo por zonas, sin sobrepasarte",
        sensations: "Firme pero controlado",
        pace: "Tempo sostenido",
        mixed: "Continuo y estable",
      });
      notes.push("La calidad del día se expresa como tempo continuo, más alineado a tu preferencia.");
    } else if (athleteContext.preferredQualityStyle === "cuestas") {
      translated.type = "Cuestas controladas";
      translated.distance = "Bloque corto + técnico";
      translated.targetPace = buildExecutionTarget(athleteContext.executionPreference, translated.targetPace, {
        zones: "Trabajo en Z3–Z4 en subida",
        sensations: "Firme en subida, suave al bajar",
        pace: "Referencia técnica, no ritmo plano",
        mixed: "Potencia controlada en cuesta",
      });
      notes.push("La calidad se vuelca a cuestas porque es el formato que mejor encaja con tus preferencias.");
    } else if (athleteContext.avoidClassicIntervals) {
      translated.type = "Tempo fraccionado controlado";
      translated.targetPace = buildExecutionTarget(athleteContext.executionPreference, translated.targetPace, {
        zones: "Bloques controlados por zonas",
        sensations: "Cortes fluidos, no agresivos",
        pace: "Tempo fraccionado",
        mixed: "Bloques continuos con pausas mínimas",
      });
      notes.push("Aunque hoy toca calidad, evitamos intervalos clásicos porque lo marcaste como restricción.");
    }

    if (planningHorizon.phase === "lejos" || planningHorizon.phase === "construccion") {
      notes.push("Como el horizonte todavía no es inmediato, la traducción busca construcción y no agresividad innecesaria.");
    } else {
      notes.push("Como el objetivo se acerca, el estímulo se vuelve más específico sin romper tu estilo preferido.");
    }
  }

  return {
    session: translated,
    label: translated.type,
    note: notes.join(" "),
  };
}
