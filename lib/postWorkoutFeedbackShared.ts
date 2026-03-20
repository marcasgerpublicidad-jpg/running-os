import { getCheckInTodayISO } from "./checkinShared";

export const POST_WORKOUT_FEEDBACK_KEY = "running-os.post-workout-feedback.v1";

export type PostWorkoutFeeling = "liviano" | "solido" | "duro" | "vacio";
export type MuscleTightness = "baja" | "media" | "alta";

export interface PostWorkoutFeedbackPayload {
  date: string;
  completed: boolean;
  rpe: number;
  felt: PostWorkoutFeeling;
  muscleTightness: MuscleTightness;
  didActivation: boolean;
  didRecovery: boolean;
  notes: string;
  updatedAt: string;
}

function isFeeling(value: unknown): value is PostWorkoutFeeling {
  return value === "liviano" || value === "solido" || value === "duro" || value === "vacio";
}

function isTightness(value: unknown): value is MuscleTightness {
  return value === "baja" || value === "media" || value === "alta";
}

function sanitizeText(value: unknown, maxLength = 240): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function getPostWorkoutFeedbackTodayISO(date = new Date()): string {
  return getCheckInTodayISO(date);
}

export function safeParsePostWorkoutFeedback(raw: string | null): PostWorkoutFeedbackPayload | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<PostWorkoutFeedbackPayload>;
    if (
      typeof parsed.date !== "string" ||
      typeof parsed.completed !== "boolean" ||
      typeof parsed.rpe !== "number" ||
      !isFeeling(parsed.felt) ||
      !isTightness(parsed.muscleTightness) ||
      typeof parsed.didActivation !== "boolean" ||
      typeof parsed.didRecovery !== "boolean"
    ) {
      return null;
    }

    return {
      date: parsed.date,
      completed: parsed.completed,
      rpe: Math.max(1, Math.min(10, Math.round(parsed.rpe))),
      felt: parsed.felt,
      muscleTightness: parsed.muscleTightness,
      didActivation: parsed.didActivation,
      didRecovery: parsed.didRecovery,
      notes: sanitizeText(parsed.notes, 320),
      updatedAt: sanitizeText(parsed.updatedAt, 64) || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
