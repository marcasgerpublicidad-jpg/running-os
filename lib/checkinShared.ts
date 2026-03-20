export const CHECKIN_KEY = "running-os.checkin.v1";
const CHECKIN_TZ = "America/Argentina/Buenos_Aires";

export type CheckInDecision = "mantener" | "bajar" | "regenerativo" | "descanso";
export type QuickCheckInStatus = "voy-bien" | "ajustar" | "muy-cargado";
export type CheckInMode = "quick" | "advanced";

export interface CheckInPayload {
  date: string;
  decision: CheckInDecision;
  subjectiveScore: number;
  mode: CheckInMode;
  quickStatus: QuickCheckInStatus | null;
  updatedAt: string;
}

function isDecision(value: unknown): value is CheckInDecision {
  return value === "mantener" || value === "bajar" || value === "regenerativo" || value === "descanso";
}

function isQuickStatus(value: unknown): value is QuickCheckInStatus {
  return value === "voy-bien" || value === "ajustar" || value === "muy-cargado";
}

function isMode(value: unknown): value is CheckInMode {
  return value === "quick" || value === "advanced";
}

export function getCheckInTodayISO(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CHECKIN_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";
  return `${year}-${month}-${day}`;
}

export function safeParseCheckIn(raw: string | null): CheckInPayload | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<CheckInPayload>;
    if (typeof parsed.date !== "string" || !isDecision(parsed.decision)) {
      return null;
    }

    return {
      date: parsed.date,
      decision: parsed.decision,
      subjectiveScore: typeof parsed.subjectiveScore === "number" ? Math.max(0, Math.min(100, Math.round(parsed.subjectiveScore))) : 0,
      mode: isMode(parsed.mode) ? parsed.mode : "advanced",
      quickStatus: isQuickStatus(parsed.quickStatus) ? parsed.quickStatus : null,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function getQuickCheckInPreset(status: QuickCheckInStatus): Pick<CheckInPayload, "decision" | "subjectiveScore"> {
  switch (status) {
    case "voy-bien":
      return { decision: "mantener", subjectiveScore: 78 };
    case "ajustar":
      return { decision: "bajar", subjectiveScore: 58 };
    case "muy-cargado":
      return { decision: "regenerativo", subjectiveScore: 32 };
  }
}

export function getQuickCheckInLabel(status: QuickCheckInStatus): string {
  switch (status) {
    case "voy-bien":
      return "Voy bien";
    case "ajustar":
      return "Ajustar";
    case "muy-cargado":
      return "Muy cargado";
  }
}
