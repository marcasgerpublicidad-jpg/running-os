export const ATHLETE_CONTEXT_KEY = "running-os.athlete-context.v1";

export type AvailabilityDay = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type PreferredIntensityModel = "sensaciones" | "zonas" | "ritmo" | "mixto";
export type PreferredSessionStyle = "steady" | "continuo" | "intervalado" | "cuestas" | "fartlek" | "gym-first";
export type SurfaceType = "calle" | "trail" | "cinta" | "bici";
export type ToleranceProfile = "equilibrado" | "tolera-intensidad" | "tolera-volumen" | "necesita-continuidad";
export type GoalType = "maraton" | "media" | "10k" | "trail" | "backyard" | "ultra" | "general" | "otro";
export type PreferredQualityStyle = "steady-z2-progresivos" | "tempo-controlado" | "cuestas" | "intervalos-clasicos" | "mixto";
export type LongRunDayPreference = "sabado" | "domingo" | "flexible";
export type ExecutionPreference = "zonas" | "sensaciones" | "ritmo" | "mixto";

export interface AthleteContextPayload {
  availabilityDays: AvailabilityDay[];
  preferredIntensityModel: PreferredIntensityModel;
  preferredSessionStyles: PreferredSessionStyle[];
  surfaceContext: SurfaceType[];
  toleranceProfile: ToleranceProfile;
  primaryGoalType: GoalType;
  primaryGoalLabel: string;
  primaryGoalDate: string;
  secondaryGoalType: GoalType;
  secondaryGoalLabel: string;
  secondaryGoalDate: string;
  goalNotes: string;
  preferredQualityStyle: PreferredQualityStyle;
  avoidClassicIntervals: boolean;
  monthlyLongRunRule: boolean;
  longRunDayPreference: LongRunDayPreference;
  executionPreference: ExecutionPreference;
  constraintNotes: string;
  scheduleConstraints: string;
  notes: string;
  updatedAt: string;
}

export interface AthleteContext extends AthleteContextPayload {
  isConfigured: boolean;
}

export const DAY_LABELS: Record<AvailabilityDay, string> = {
  mon: "Lun",
  tue: "Mar",
  wed: "Mié",
  thu: "Jue",
  fri: "Vie",
  sat: "Sáb",
  sun: "Dom",
};

export const INTENSITY_MODEL_LABELS: Record<PreferredIntensityModel, string> = {
  sensaciones: "Por sensaciones",
  zonas: "Por zonas",
  ritmo: "Por ritmo",
  mixto: "Mixto",
};

export const SESSION_STYLE_LABELS: Record<PreferredSessionStyle, string> = {
  steady: "Steady",
  continuo: "Continuo",
  intervalado: "Intervalado",
  cuestas: "Cuestas",
  fartlek: "Fartlek",
  "gym-first": "Gym-first",
};

export const SURFACE_LABELS: Record<SurfaceType, string> = {
  calle: "Calle",
  trail: "Trail",
  cinta: "Cinta",
  bici: "Bici",
};

export const TOLERANCE_LABELS: Record<ToleranceProfile, string> = {
  equilibrado: "Equilibrado",
  "tolera-intensidad": "Tolera intensidad",
  "tolera-volumen": "Tolera volumen",
  "necesita-continuidad": "Necesita continuidad",
};

export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  maraton: "Maratón",
  media: "Media maratón",
  "10k": "10K",
  trail: "Trail",
  backyard: "Backyard",
  ultra: "Ultra",
  general: "Objetivo general",
  otro: "Otro",
};

export const QUALITY_STYLE_LABELS: Record<PreferredQualityStyle, string> = {
  "steady-z2-progresivos": "Steady / Z2 / progresivos",
  "tempo-controlado": "Tempo controlado",
  cuestas: "Cuestas",
  "intervalos-clasicos": "Intervalos clásicos",
  mixto: "Mixto",
};

export const LONG_RUN_DAY_LABELS: Record<LongRunDayPreference, string> = {
  sabado: "Sábado",
  domingo: "Domingo",
  flexible: "Flexible",
};

export const EXECUTION_PREFERENCE_LABELS: Record<ExecutionPreference, string> = {
  zonas: "Por zonas",
  sensaciones: "Por sensaciones",
  ritmo: "Por ritmo",
  mixto: "Mixto",
};

export const DEFAULT_ATHLETE_CONTEXT: AthleteContextPayload = {
  availabilityDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
  preferredIntensityModel: "mixto",
  preferredSessionStyles: ["steady", "continuo"],
  surfaceContext: ["calle"],
  toleranceProfile: "equilibrado",
  primaryGoalType: "general",
  primaryGoalLabel: "",
  primaryGoalDate: "",
  secondaryGoalType: "general",
  secondaryGoalLabel: "",
  secondaryGoalDate: "",
  goalNotes: "",
  preferredQualityStyle: "mixto",
  avoidClassicIntervals: false,
  monthlyLongRunRule: false,
  longRunDayPreference: "flexible",
  executionPreference: "mixto",
  constraintNotes: "",
  scheduleConstraints: "",
  notes: "",
  updatedAt: "",
};

function isAvailabilityDay(value: unknown): value is AvailabilityDay {
  return value === "mon" || value === "tue" || value === "wed" || value === "thu" || value === "fri" || value === "sat" || value === "sun";
}

function isPreferredIntensityModel(value: unknown): value is PreferredIntensityModel {
  return value === "sensaciones" || value === "zonas" || value === "ritmo" || value === "mixto";
}

function isPreferredSessionStyle(value: unknown): value is PreferredSessionStyle {
  return value === "steady" || value === "continuo" || value === "intervalado" || value === "cuestas" || value === "fartlek" || value === "gym-first";
}

function isSurfaceType(value: unknown): value is SurfaceType {
  return value === "calle" || value === "trail" || value === "cinta" || value === "bici";
}

function isToleranceProfile(value: unknown): value is ToleranceProfile {
  return value === "equilibrado" || value === "tolera-intensidad" || value === "tolera-volumen" || value === "necesita-continuidad";
}

function isGoalType(value: unknown): value is GoalType {
  return value === "maraton" || value === "media" || value === "10k" || value === "trail" || value === "backyard" || value === "ultra" || value === "general" || value === "otro";
}

function isPreferredQualityStyle(value: unknown): value is PreferredQualityStyle {
  return value === "steady-z2-progresivos" || value === "tempo-controlado" || value === "cuestas" || value === "intervalos-clasicos" || value === "mixto";
}

function isLongRunDayPreference(value: unknown): value is LongRunDayPreference {
  return value === "sabado" || value === "domingo" || value === "flexible";
}

function isExecutionPreference(value: unknown): value is ExecutionPreference {
  return value === "zonas" || value === "sensaciones" || value === "ritmo" || value === "mixto";
}

function sanitizeString(value: unknown, maxLength = 220): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function sanitizeDateString(value: unknown): string {
  const normalized = typeof value === "string" ? value.trim().slice(0, 32) : "";
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : "";
}

function sanitizeBoolean(value: unknown): boolean {
  return value === true;
}

function sanitizeArray<T>(value: unknown, guard: (entry: unknown) => entry is T): T[] {
  if (!Array.isArray(value)) return [];
  return value.filter(guard);
}

export function safeParseAthleteContext(raw: string | null): AthleteContextPayload | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<AthleteContextPayload>;
    const availabilityDays = sanitizeArray(parsed.availabilityDays, isAvailabilityDay);
    const preferredSessionStyles = sanitizeArray(parsed.preferredSessionStyles, isPreferredSessionStyle);
    const surfaceContext = sanitizeArray(parsed.surfaceContext, isSurfaceType);

    if (
      !isPreferredIntensityModel(parsed.preferredIntensityModel) ||
      !isToleranceProfile(parsed.toleranceProfile) ||
      !isGoalType(parsed.primaryGoalType ?? DEFAULT_ATHLETE_CONTEXT.primaryGoalType) ||
      !isGoalType(parsed.secondaryGoalType ?? DEFAULT_ATHLETE_CONTEXT.secondaryGoalType) ||
      !isPreferredQualityStyle(parsed.preferredQualityStyle ?? DEFAULT_ATHLETE_CONTEXT.preferredQualityStyle) ||
      !isLongRunDayPreference(parsed.longRunDayPreference ?? DEFAULT_ATHLETE_CONTEXT.longRunDayPreference) ||
      !isExecutionPreference(parsed.executionPreference ?? DEFAULT_ATHLETE_CONTEXT.executionPreference)
    ) {
      return null;
    }

    return {
      availabilityDays: availabilityDays.length > 0 ? availabilityDays : DEFAULT_ATHLETE_CONTEXT.availabilityDays,
      preferredIntensityModel: parsed.preferredIntensityModel,
      preferredSessionStyles: preferredSessionStyles.length > 0 ? preferredSessionStyles : DEFAULT_ATHLETE_CONTEXT.preferredSessionStyles,
      surfaceContext: surfaceContext.length > 0 ? surfaceContext : DEFAULT_ATHLETE_CONTEXT.surfaceContext,
      toleranceProfile: parsed.toleranceProfile,
      primaryGoalType: parsed.primaryGoalType ?? DEFAULT_ATHLETE_CONTEXT.primaryGoalType,
      primaryGoalLabel: sanitizeString(parsed.primaryGoalLabel, 120),
      primaryGoalDate: sanitizeDateString(parsed.primaryGoalDate),
      secondaryGoalType: parsed.secondaryGoalType ?? DEFAULT_ATHLETE_CONTEXT.secondaryGoalType,
      secondaryGoalLabel: sanitizeString(parsed.secondaryGoalLabel, 120),
      secondaryGoalDate: sanitizeDateString(parsed.secondaryGoalDate),
      goalNotes: sanitizeString(parsed.goalNotes, 320),
      preferredQualityStyle: parsed.preferredQualityStyle ?? DEFAULT_ATHLETE_CONTEXT.preferredQualityStyle,
      avoidClassicIntervals: sanitizeBoolean(parsed.avoidClassicIntervals),
      monthlyLongRunRule: sanitizeBoolean(parsed.monthlyLongRunRule),
      longRunDayPreference: parsed.longRunDayPreference ?? DEFAULT_ATHLETE_CONTEXT.longRunDayPreference,
      executionPreference: parsed.executionPreference ?? DEFAULT_ATHLETE_CONTEXT.executionPreference,
      constraintNotes: sanitizeString(parsed.constraintNotes, 320),
      scheduleConstraints: sanitizeString(parsed.scheduleConstraints, 240),
      notes: sanitizeString(parsed.notes, 400),
      updatedAt: sanitizeString(parsed.updatedAt, 64) || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function resolveAthleteContext(payload: AthleteContextPayload | null): AthleteContext {
  if (!payload) {
    return {
      ...DEFAULT_ATHLETE_CONTEXT,
      updatedAt: "",
      isConfigured: false,
    };
  }

  return {
    ...payload,
    isConfigured: true,
  };
}

export function formatAvailabilityDays(days: AvailabilityDay[]): string {
  return days.map((day) => DAY_LABELS[day]).join(" · ");
}

export function formatSessionStyles(styles: PreferredSessionStyle[]): string {
  return styles.map((style) => SESSION_STYLE_LABELS[style]).join(" · ");
}

export function formatSurfaces(surfaces: SurfaceType[]): string {
  return surfaces.map((surface) => SURFACE_LABELS[surface]).join(" · ");
}

export function formatGoalLabel(type: GoalType, label: string): string {
  return label || GOAL_TYPE_LABELS[type];
}

export function buildAthleteExecutionCue(context: AthleteContext | AthleteContextPayload | null): string | null {
  if (!context) return null;
  if ("isConfigured" in context && !context.isConfigured) return null;

  const parts: string[] = [];

  if (context.executionPreference === "zonas" || context.preferredIntensityModel === "zonas") {
    parts.push("Guiá la ejecución de hoy principalmente por zonas.");
  } else if (context.executionPreference === "sensaciones" || context.preferredIntensityModel === "sensaciones") {
    parts.push("Priorizá sensaciones como referencia principal de ejecución.");
  } else if (context.executionPreference === "ritmo" || context.preferredIntensityModel === "ritmo") {
    parts.push("Tomá el ritmo objetivo como referencia primaria si la sesión lo permite.");
  } else {
    parts.push("Combiná sensaciones con zonas o ritmo para ejecutar mejor la sesión.");
  }

  if (context.preferredQualityStyle === "steady-z2-progresivos") {
    parts.push("Si aparece calidad, priorizá steady, Z2 o progresivos antes que cortes clásicos.");
  } else if (context.preferredQualityStyle === "tempo-controlado") {
    parts.push("Cuando el día pida calidad, incliná la ejecución hacia un tempo controlado.");
  } else if (context.preferredQualityStyle === "cuestas") {
    parts.push("Si hace falta meter calidad, las cuestas son el formato preferido.");
  }

  if (context.avoidClassicIntervals) {
    parts.push("Evitá traducir el estímulo en intervalos clásicos salvo que sea indispensable.");
  }

  if (context.monthlyLongRunRule) {
    parts.push("Reservá el fondo extendido mensual como regla estructural, no como improvisación del día.");
  }

  if (context.longRunDayPreference !== "flexible") {
    parts.push(`El fondo se ordena mejor si cae el ${LONG_RUN_DAY_LABELS[context.longRunDayPreference].toLowerCase()}.`);
  }

  if (context.scheduleConstraints) {
    parts.push(`Respetá tu ventana real: ${context.scheduleConstraints}.`);
  }

  if (context.constraintNotes) {
    parts.push(context.constraintNotes);
  }

  return parts.join(" ");
}
