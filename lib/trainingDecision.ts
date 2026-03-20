import { NEXT_SESSION, type DayPlan, type NextSession, type SessionType, WEEKLY_PLAN } from "./data";
import type { CheckInPayload } from "./checkinShared";
import { buildAthleteExecutionCue, type AthleteContext } from "./athleteContextShared";
import { getReadinessStatus, type DailyMetrics } from "./metrics";
import type { DataSource, TrainingDataReason } from "./dashboardData";
import { buildPreSessionActivation, type PreSessionActivation } from "./sessionPreparation";
import { buildPostSessionRecovery, type PostSessionRecovery } from "./postWorkoutRecovery";
import { buildGoalFocusCue, getPlanningHorizon, type PlanningHorizon } from "./planningHorizon";
import type { PostWorkoutFeedbackPayload } from "./postWorkoutFeedbackShared";
import { translateSessionStimulus } from "./sessionTranslation";
import {
  buildPostWorkoutCue,
  buildSignalHierarchyCue,
  getManualOverrideAdjustment,
  getPostWorkoutAdjustment,
  getQuickCheckInAdjustment,
} from "./inputSignalFusion";

type Signal = "green" | "amber" | "red";
type LoadState = "fresh" | "balanced" | "fatigued" | "overreached" | "unknown";
type SessionAdjustment = "keep" | "reduce" | "regenerative" | "rest";

function getTodayIndex(date = new Date()): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Argentina/Buenos_Aires",
    weekday: "short",
  }).format(date);

  const map: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };

  return map[weekday] ?? 0;
}

export function getWeeklyStructure(baseWeeklyPlan: DayPlan[] = WEEKLY_PLAN): DayPlan[] {
  const todayIndex = getTodayIndex();
  return baseWeeklyPlan.map((day, index) => ({
    ...day,
    isToday: index === todayIndex,
  }));
}

function getLoadState(todayMetrics: DailyMetrics | null, source: DataSource): LoadState {
  if (source !== "strava" || !todayMetrics) return "unknown";
  if (todayMetrics.tsb <= -25 || todayMetrics.atl >= 85) return "overreached";
  if (todayMetrics.tsb <= -10 || todayMetrics.atl >= 70) return "fatigued";
  if (todayMetrics.tsb >= 8) return "fresh";
  return "balanced";
}

function getReadinessAdjustment(readinessSignal: Signal, subjectiveScore: number | null): SessionAdjustment {
  if (subjectiveScore !== null && subjectiveScore <= 20) return "rest";
  if (readinessSignal === "red" || (subjectiveScore !== null && subjectiveScore <= 35)) return "regenerative";
  if (readinessSignal === "amber" || (subjectiveScore !== null && subjectiveScore <= 55)) return "reduce";
  return "keep";
}

function getPmcAdjustment(loadState: LoadState): SessionAdjustment {
  switch (loadState) {
    case "overreached":
      return "rest";
    case "fatigued":
      return "reduce";
    default:
      return "keep";
  }
}

function mergeAdjustments(...adjustments: SessionAdjustment[]): SessionAdjustment {
  const rankMap: Record<SessionAdjustment, number> = {
    keep: 0,
    reduce: 1,
    regenerative: 2,
    rest: 3,
  };

  return adjustments.reduce((current, candidate) =>
    rankMap[candidate] > rankMap[current] ? candidate : current
  , "keep");
}

function getTodaySessionType(baseType: SessionType, adjustment: SessionAdjustment): SessionType {
  if (adjustment === "rest") return "Descanso";
  if (adjustment === "regenerative") return "Recuperación";
  return baseType;
}

export interface WeeklyStructureState {
  days: DayPlan[];
  todayIndex: number;
  todayPlan: DayPlan | null;
}

export interface DailyRecommendation {
  readiness: { signal: Signal; label: string };
  readinessSignal: Signal;
  loadState: LoadState;
  source: DataSource;
  reason?: TrainingDataReason;
  recommendedAdjustment: SessionAdjustment;
  title: string;
  body: string;
}

export interface DailyModificationLayer {
  applied: boolean;
  adjustment: SessionAdjustment;
  reason: string;
}

export interface DailyTrainingDecision {
  weeklyStructure: WeeklyStructureState;
  dailyRecommendation: DailyRecommendation;
  dailyModification: DailyModificationLayer;
  planningHorizon: PlanningHorizon;
  preSessionActivation: PreSessionActivation;
  postSessionRecovery: PostSessionRecovery;
  weeklyPlan: DayPlan[];
  nextSession: NextSession;
  translatedStimulusNote: string;
  recommendationTitle: string;
  recommendationBody: string;
  checkInApplied: boolean;
}

export function getTrainingReadiness(params: {
  source: DataSource;
  reason?: TrainingDataReason;
  todayMetrics?: DailyMetrics | null;
  hrvDeviation: number;
}): { signal: Signal; label: string } {
  const { source, reason, todayMetrics = null, hrvDeviation } = params;

  if (source === "strava" && todayMetrics) {
    return getReadinessStatus(todayMetrics.tsb, hrvDeviation);
  }

  if (source === "not_connected") {
    return { signal: "amber", label: "Sin datos de Strava" };
  }

  if (reason === "upstream_error") {
    return { signal: "amber", label: "Fallback activo" };
  }

  return { signal: "amber", label: "Datos limitados" };
}

function buildNextSession(
  baseNextSession: NextSession,
  basePlan: DayPlan,
  adjustment: SessionAdjustment
): NextSession {
  if (adjustment === "keep") {
    return {
      ...baseNextSession,
      estimatedTSS: basePlan.tss > 0 ? basePlan.tss : baseNextSession.estimatedTSS,
    };
  }

  if (adjustment === "reduce") {
    const reducedTss = Math.max(0, Math.round(basePlan.tss * 0.8));
    return {
      ...baseNextSession,
      duration: "55–60 min",
      distance: "10–11 km",
      hrZone: "Z2–Z3",
      targetPace: "5:25–5:45 /km",
      estimatedTSS: reducedTss,
    };
  }

  if (adjustment === "regenerative") {
    return {
      ...baseNextSession,
      type: basePlan.type === "Descanso" ? "Descanso total" : "Rodaje regenerativo",
      duration: basePlan.type === "Descanso" ? "Libre" : "35–45 min",
      distance: basePlan.type === "Descanso" ? "—" : "6–8 km",
      hrZone: basePlan.type === "Descanso" ? "—" : "Z1–Z2",
      targetPace: basePlan.type === "Descanso" ? "—" : "Muy suave / conversacional",
      estimatedTSS: basePlan.type === "Descanso" ? 0 : Math.min(basePlan.tss, 30),
    };
  }

  return {
    ...baseNextSession,
    type: "Descanso total",
    duration: "Recuperación",
    distance: "—",
    hrZone: "—",
    targetPace: "Sin sesión",
    estimatedTSS: 0,
  };
}

function buildRecommendationSummary(
  source: DataSource,
  loadState: LoadState,
  adjustment: SessionAdjustment,
  checkIn: CheckInPayload | null
): { title: string; body: string } {
  if (adjustment === "rest") {
    return {
      title: "Descanso hoy",
      body: "La estructura semanal se conserva, pero la sesión de hoy pasa a descanso total por combinación de fatiga y check-in.",
    };
  }

  if (adjustment === "regenerative") {
    return {
      title: "Pasar a regenerativo",
      body: "La semana mantiene su periodización base y sólo se transforma el estímulo de hoy en una sesión de recuperación.",
    };
  }

  if (adjustment === "reduce") {
    return {
      title: "Bajar la carga de hoy",
      body: "Se mantiene el tipo general de sesión del día, pero con menos volumen o intensidad para no desordenar la semana.",
    };
  }

  if (source !== "strava") {
    return {
      title: "Sesión según estructura base",
      body: "Sin señales PMC confiables, se mantiene la estructura semanal y sólo se considera el check-in si existe.",
    };
  }

  if (checkIn) {
    return {
      title: "Sesión del día confirmada",
      body: "El check-in no exige modificar la sesión. La recomendación diaria sigue la periodización base respaldada por readiness y PMC.",
    };
  }

  if (loadState === "fresh") {
    return {
      title: "Buen día para sostener calidad",
      body: "Las señales de PMC/readiness acompañan la sesión prevista. No hace falta alterar la semana.",
    };
  }

  return {
    title: "Sesión del día según plan base",
    body: "La estructura semanal se mantiene y no hay señales suficientes para modificar el estímulo de hoy.",
  };
}

export function buildDailyTrainingDecision(params: {
  checkIn: CheckInPayload | null;
  postWorkoutFeedback?: PostWorkoutFeedbackPayload | null;
  athleteContext?: AthleteContext | null;
  readiness?: { signal: Signal; label: string };
  todayMetrics?: DailyMetrics | null;
  source?: DataSource;
  reason?: TrainingDataReason;
  hrvDeviation?: number;
  baseWeeklyPlan?: DayPlan[];
  baseNextSession?: NextSession;
}): DailyTrainingDecision {
  const {
    checkIn,
    postWorkoutFeedback = null,
    athleteContext = null,
    readiness,
    todayMetrics = null,
    source = "fallback",
    reason,
    hrvDeviation = 0,
    baseWeeklyPlan = WEEKLY_PLAN,
    baseNextSession = NEXT_SESSION,
  } = params;

  const resolvedReadiness = readiness ?? getTrainingReadiness({
    source,
    reason,
    todayMetrics,
    hrvDeviation,
  });
  const planningHorizon = getPlanningHorizon(athleteContext);

  const structureDays = getWeeklyStructure(baseWeeklyPlan);
  const todayIndex = structureDays.findIndex((day) => day.isToday);
  const todayPlan = todayIndex >= 0 ? structureDays[todayIndex] : null;
  const loadState = getLoadState(todayMetrics, source);
  const recommendedAdjustment = mergeAdjustments(
    getPmcAdjustment(loadState),
    getPostWorkoutAdjustment(postWorkoutFeedback),
    getReadinessAdjustment(resolvedReadiness.signal, checkIn?.subjectiveScore ?? null),
    getQuickCheckInAdjustment(checkIn),
    getManualOverrideAdjustment(checkIn)
  );

  const recommendationSummary = buildRecommendationSummary(
    source,
    loadState,
    recommendedAdjustment,
    checkIn
  );
  const athleteExecutionCue = buildAthleteExecutionCue(athleteContext);
  const goalFocusCue = buildGoalFocusCue(planningHorizon);
  const postWorkoutCue = buildPostWorkoutCue(postWorkoutFeedback);
  const hierarchyCue = buildSignalHierarchyCue({ feedback: postWorkoutFeedback, checkIn });
  const resolvedRecommendationBody = [
    recommendationSummary.body,
    postWorkoutCue,
    goalFocusCue,
    athleteExecutionCue,
    hierarchyCue,
  ]
    .filter(Boolean)
    .join(" ");
  const resolvedRecommendationTitle =
    planningHorizon.dominantGoal?.displayLabel && recommendedAdjustment === "keep"
      ? `Sumar hacia ${planningHorizon.dominantGoal.displayLabel}`
      : recommendationSummary.title;

  if (!todayPlan) {
    return {
      weeklyStructure: { days: structureDays, todayIndex: -1, todayPlan: null },
      dailyRecommendation: {
        readiness: resolvedReadiness,
        readinessSignal: resolvedReadiness.signal,
        loadState,
        source,
        reason,
        recommendedAdjustment,
        title: "Sesión del día sin cambios",
        body: athleteExecutionCue
          ? `No encontramos el día actual en la estructura semanal. ${athleteExecutionCue}`
          : "No encontramos el día actual en la estructura semanal.",
      },
      dailyModification: {
        applied: false,
        adjustment: "keep",
        reason: "No se encontró el día actual dentro del plan semanal.",
      },
      planningHorizon,
      preSessionActivation: buildPreSessionActivation({
        todayPlan: null,
        readinessSignal: resolvedReadiness.signal,
        athleteContext,
      }),
      postSessionRecovery: buildPostSessionRecovery({
        todayPlan: null,
        readinessSignal: resolvedReadiness.signal,
        athleteContext,
        source,
        todayMetrics,
      }),
      weeklyPlan: structureDays,
      nextSession: baseNextSession,
      translatedStimulusNote: "No encontramos el día actual en la estructura semanal.",
      recommendationTitle: "Sesión del día sin cambios",
      recommendationBody: athleteExecutionCue
        ? `No encontramos el día actual en la estructura semanal. ${athleteExecutionCue}`
        : "No encontramos el día actual en la estructura semanal.",
      checkInApplied: false,
    };
  }

  const peakTss = Math.max(...structureDays.map((day) => day.tss), 1);
  const adjustedType = getTodaySessionType(todayPlan.type, recommendedAdjustment);
  const adjustedTss = recommendedAdjustment === "rest"
    ? 0
    : recommendedAdjustment === "regenerative"
      ? Math.min(todayPlan.tss, 30)
      : recommendedAdjustment === "reduce"
        ? Math.max(0, Math.round(todayPlan.tss * 0.8))
        : todayPlan.tss;

  const adjustedToday: DayPlan = {
    ...todayPlan,
    type: adjustedType,
    tss: adjustedTss,
    pct: adjustedTss === 0 ? 0 : adjustedTss / peakTss,
    color: recommendedAdjustment === "rest"
      ? "#383838"
      : recommendedAdjustment === "regenerative"
        ? "#4ADE80"
        : recommendedAdjustment === "reduce"
          ? todayPlan.color
          : todayPlan.color,
  };

  const resolvedWeeklyPlan = structureDays.map((day, index) => (
    index === todayIndex ? adjustedToday : day
  ));
  const baseResolvedNextSession = buildNextSession(baseNextSession, todayPlan, recommendedAdjustment);
  const translatedStimulus = translateSessionStimulus({
    baseSession: baseResolvedNextSession,
    todayPlan: adjustedToday,
    athleteContext,
    planningHorizon,
  });
  const modificationApplied = recommendedAdjustment !== "keep";
  const preSessionActivation = buildPreSessionActivation({
    todayPlan: adjustedToday,
    readinessSignal: resolvedReadiness.signal,
    athleteContext,
  });
  const postSessionRecovery = buildPostSessionRecovery({
    todayPlan: adjustedToday,
    readinessSignal: resolvedReadiness.signal,
    athleteContext,
    source,
    todayMetrics,
  });

  return {
    weeklyStructure: {
      days: structureDays,
      todayIndex,
      todayPlan,
    },
    dailyRecommendation: {
      readiness: resolvedReadiness,
      readinessSignal: resolvedReadiness.signal,
      loadState,
      source,
      reason,
      recommendedAdjustment,
      title: recommendationSummary.title,
      body: resolvedRecommendationBody,
    },
    dailyModification: {
      applied: modificationApplied,
      adjustment: recommendedAdjustment,
      reason: modificationApplied
        ? "La modificación se aplica sólo al día actual para respetar la estructura semanal."
        : "No se requieren ajustes para hoy; la estructura semanal base se mantiene.",
    },
    planningHorizon,
    preSessionActivation,
    postSessionRecovery,
    weeklyPlan: resolvedWeeklyPlan,
    nextSession: translatedStimulus.session,
    translatedStimulusNote: translatedStimulus.note,
    recommendationTitle: resolvedRecommendationTitle,
    recommendationBody: resolvedRecommendationBody,
    checkInApplied: checkIn !== null,
  };
}
