import {
  GOAL_TYPE_LABELS,
  formatGoalLabel,
  type AthleteContext,
  type GoalType,
} from "./athleteContextShared";

type HorizonPhase = "sin-objetivo" | "lejos" | "construccion" | "especifica" | "afinacion";

export interface GoalTargetStatus {
  configured: boolean;
  type: GoalType | null;
  label: string | null;
  date: string | null;
  daysUntil: number | null;
  weeksUntil: number | null;
  displayLabel: string | null;
}

export interface PlanningHorizon {
  hasGoals: boolean;
  primary: GoalTargetStatus;
  secondary: GoalTargetStatus;
  dominantGoal: GoalTargetStatus | null;
  dominantSlot: "primary" | "secondary" | null;
  phase: HorizonPhase;
  phaseLabel: string;
  summary: string;
}

function startOfLocalDay(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseGoalDate(value: string): Date | null {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function buildGoalStatus(type: GoalType, label: string, date: string): GoalTargetStatus {
  const displayLabel = formatGoalLabel(type, label);
  const hasAnyValue = Boolean(label || date);
  const goalDate = parseGoalDate(date);

  if (!hasAnyValue) {
    return {
      configured: false,
      type: null,
      label: null,
      date: null,
      daysUntil: null,
      weeksUntil: null,
      displayLabel: null,
    };
  }

  if (!goalDate) {
    return {
      configured: true,
      type,
      label: label || null,
      date: date || null,
      daysUntil: null,
      weeksUntil: null,
      displayLabel,
    };
  }

  const today = startOfLocalDay();
  const diffMs = goalDate.getTime() - today.getTime();
  const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const weeksUntil = Math.max(0, Math.ceil(daysUntil / 7));

  return {
    configured: true,
    type,
    label: label || null,
    date,
    daysUntil,
    weeksUntil,
    displayLabel,
  };
}

function resolveDominantGoal(primary: GoalTargetStatus, secondary: GoalTargetStatus): {
  goal: GoalTargetStatus | null;
  slot: "primary" | "secondary" | null;
} {
  const candidates = [
    primary.configured ? { slot: "primary" as const, goal: primary } : null,
    secondary.configured ? { slot: "secondary" as const, goal: secondary } : null,
  ].filter(Boolean) as Array<{ slot: "primary" | "secondary"; goal: GoalTargetStatus }>;

  if (candidates.length === 0) {
    return { goal: null, slot: null };
  }

  const datedCandidates = candidates.filter(({ goal }) => goal.daysUntil !== null && goal.daysUntil >= 0);
  if (datedCandidates.length > 0) {
    datedCandidates.sort((a, b) => (a.goal.daysUntil ?? Number.MAX_SAFE_INTEGER) - (b.goal.daysUntil ?? Number.MAX_SAFE_INTEGER));
    return { goal: datedCandidates[0].goal, slot: datedCandidates[0].slot };
  }

  return { goal: candidates[0].goal, slot: candidates[0].slot };
}

function resolvePhase(daysUntil: number | null): { phase: HorizonPhase; phaseLabel: string } {
  if (daysUntil === null) {
    return { phase: "sin-objetivo", phaseLabel: "Sin horizonte cargado" };
  }

  if (daysUntil > 112) {
    return { phase: "lejos", phaseLabel: "Horizonte largo" };
  }

  if (daysUntil > 42) {
    return { phase: "construccion", phaseLabel: "Bloque de construcción" };
  }

  if (daysUntil > 14) {
    return { phase: "especifica", phaseLabel: "Ventana específica" };
  }

  return { phase: "afinacion", phaseLabel: "Ventana cercana" };
}

function buildSummary(
  primary: GoalTargetStatus,
  secondary: GoalTargetStatus,
  dominantGoal: GoalTargetStatus | null,
  phaseLabel: string
): string {
  if (!dominantGoal) {
    return "Todavía no cargaste un objetivo principal o secundario. Cuando lo hagas, Running OS va a poder contextualizar mejor el plan.";
  }

  const dominantTime =
    dominantGoal.weeksUntil !== null
      ? `Faltan ${dominantGoal.weeksUntil} semanas para ${dominantGoal.displayLabel}.`
      : `Objetivo dominante actual: ${dominantGoal.displayLabel}.`;

  if (secondary.configured && secondary !== dominantGoal) {
    return `${dominantTime} Objetivo secundario en espera: ${secondary.displayLabel}. ${phaseLabel}.`;
  }

  if (primary.configured && primary !== dominantGoal) {
    return `${dominantTime} Objetivo principal cargado: ${primary.displayLabel}. ${phaseLabel}.`;
  }

  return `${dominantTime} ${phaseLabel}.`;
}

export function getPlanningHorizon(context: AthleteContext | null): PlanningHorizon {
  const primary = buildGoalStatus(
    context?.primaryGoalType ?? "general",
    context?.primaryGoalLabel ?? "",
    context?.primaryGoalDate ?? ""
  );
  const secondary = buildGoalStatus(
    context?.secondaryGoalType ?? "general",
    context?.secondaryGoalLabel ?? "",
    context?.secondaryGoalDate ?? ""
  );
  const { goal: dominantGoal, slot: dominantSlot } = resolveDominantGoal(primary, secondary);
  const { phase, phaseLabel } = resolvePhase(dominantGoal?.daysUntil ?? null);

  return {
    hasGoals: primary.configured || secondary.configured,
    primary,
    secondary,
    dominantGoal,
    dominantSlot,
    phase,
    phaseLabel,
    summary: buildSummary(primary, secondary, dominantGoal, phaseLabel),
  };
}

export function buildGoalFocusCue(horizon: PlanningHorizon): string | null {
  if (!horizon.dominantGoal?.displayLabel) return null;

  if (horizon.dominantGoal.weeksUntil !== null) {
    return `Hoy sumá con foco en ${horizon.dominantGoal.displayLabel}: faltan ${horizon.dominantGoal.weeksUntil} semanas y el bloque actual es ${horizon.phaseLabel.toLowerCase()}.`;
  }

  return `Hoy ejecutá pensando en ${horizon.dominantGoal.displayLabel} como objetivo dominante.`;
}

export function getGoalTypeDisplay(type: GoalType | null): string {
  return type ? GOAL_TYPE_LABELS[type] : "Sin objetivo";
}
