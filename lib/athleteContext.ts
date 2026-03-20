import "server-only";

import { cookies } from "next/headers";
import {
  ATHLETE_CONTEXT_KEY,
  DEFAULT_ATHLETE_CONTEXT,
  DAY_LABELS,
  EXECUTION_PREFERENCE_LABELS,
  GOAL_TYPE_LABELS,
  INTENSITY_MODEL_LABELS,
  LONG_RUN_DAY_LABELS,
  QUALITY_STYLE_LABELS,
  SESSION_STYLE_LABELS,
  SURFACE_LABELS,
  TOLERANCE_LABELS,
  buildAthleteExecutionCue,
  formatGoalLabel,
  formatAvailabilityDays,
  formatSessionStyles,
  formatSurfaces,
  resolveAthleteContext,
  safeParseAthleteContext,
  type AthleteContext,
  type AthleteContextPayload,
} from "./athleteContextShared";

export {
  ATHLETE_CONTEXT_KEY,
  DEFAULT_ATHLETE_CONTEXT,
  DAY_LABELS,
  EXECUTION_PREFERENCE_LABELS,
  GOAL_TYPE_LABELS,
  INTENSITY_MODEL_LABELS,
  LONG_RUN_DAY_LABELS,
  QUALITY_STYLE_LABELS,
  SESSION_STYLE_LABELS,
  SURFACE_LABELS,
  TOLERANCE_LABELS,
  formatAvailabilityDays,
  formatGoalLabel,
  formatSessionStyles,
  formatSurfaces,
  buildAthleteExecutionCue,
} from "./athleteContextShared";

export type {
  AthleteContext,
  AthleteContextPayload,
  AvailabilityDay,
  ExecutionPreference,
  GoalType,
  LongRunDayPreference,
  PreferredIntensityModel,
  PreferredQualityStyle,
  PreferredSessionStyle,
  SurfaceType,
  ToleranceProfile,
} from "./athleteContextShared";

export async function getStoredAthleteContext(): Promise<AthleteContextPayload | null> {
  const jar = await cookies();
  return safeParseAthleteContext(jar.get(ATHLETE_CONTEXT_KEY)?.value ?? null);
}

export async function getAthleteContext(): Promise<AthleteContext> {
  const payload = await getStoredAthleteContext();
  return resolveAthleteContext(payload);
}
