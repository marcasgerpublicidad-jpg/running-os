import type { CheckInPayload } from "./checkinShared";
import type { PostWorkoutFeedbackPayload } from "./postWorkoutFeedbackShared";

export type SignalAdjustment = "keep" | "reduce" | "regenerative" | "rest";

export function getPostWorkoutAdjustment(feedback: PostWorkoutFeedbackPayload | null): SignalAdjustment {
  if (!feedback) return "keep";
  if (!feedback.completed) return "reduce";

  let score = 0;

  if (feedback.rpe >= 9) score += 2;
  else if (feedback.rpe >= 8) score += 1;

  if (feedback.felt === "vacio") score += 2;
  else if (feedback.felt === "duro") score += 1;

  if (feedback.muscleTightness === "alta") score += 2;
  else if (feedback.muscleTightness === "media") score += 1;

  if (!feedback.didRecovery) score += 1;
  if (!feedback.didActivation && feedback.rpe >= 8) score += 1;

  if (score >= 5) return "regenerative";
  if (score >= 2) return "reduce";
  return "keep";
}

export function getQuickCheckInAdjustment(checkIn: CheckInPayload | null): SignalAdjustment {
  if (!checkIn || checkIn.mode !== "quick") return "keep";

  if (checkIn.quickStatus === "muy-cargado") return "regenerative";
  if (checkIn.quickStatus === "ajustar") return "reduce";
  return "keep";
}

export function getManualOverrideAdjustment(checkIn: CheckInPayload | null): SignalAdjustment {
  if (!checkIn || checkIn.mode !== "advanced") return "keep";

  switch (checkIn.decision) {
    case "descanso":
      return "rest";
    case "regenerativo":
      return "regenerative";
    case "bajar":
      return "reduce";
    default:
      return "keep";
  }
}

export function buildPostWorkoutCue(feedback: PostWorkoutFeedbackPayload | null): string | null {
  if (!feedback) return null;

  const parts: string[] = [];

  if (!feedback.completed) {
    parts.push("La sesión anterior quedó incompleta, así que hoy conviene entrar con más margen.");
  }

  if (feedback.rpe >= 8 || feedback.felt === "duro" || feedback.felt === "vacio") {
    parts.push("El cierre post-entreno marcó fatiga subjetiva alta.");
  }

  if (feedback.muscleTightness === "alta") {
    parts.push("La rigidez muscular quedó alta y eso pesa en la recomendación de hoy.");
  }

  if (!feedback.didRecovery) {
    parts.push("Como faltó la descarga post-entreno, la recuperación del día siguiente se vuelve más conservadora.");
  }

  if (!feedback.didActivation && feedback.rpe >= 8) {
    parts.push("También faltó activación previa en una sesión exigente, así que el sistema suma cautela.");
  }

  return parts.length > 0 ? parts.join(" ") : "El feedback post-entreno reciente acompaña una lectura estable para hoy.";
}

export function buildSignalHierarchyCue(params: {
  feedback: PostWorkoutFeedbackPayload | null;
  checkIn: CheckInPayload | null;
}): string | null {
  const { feedback, checkIn } = params;

  if (checkIn?.mode === "advanced") {
    return "El ajuste manual avanzado queda como override final sobre las demás señales.";
  }

  if (checkIn?.mode === "quick") {
    return "El pre-check-in rápido modula fino el día actual, pero no reemplaza el feedback post-entreno.";
  }

  if (feedback) {
    return "Hoy pesa más el cierre de la sesión anterior que el input previo manual.";
  }

  return null;
}
