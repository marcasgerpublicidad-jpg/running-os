import "server-only";

import { cookies } from "next/headers";
import {
  POST_WORKOUT_FEEDBACK_KEY,
  getPostWorkoutFeedbackTodayISO,
  safeParsePostWorkoutFeedback,
  type PostWorkoutFeedbackPayload,
} from "./postWorkoutFeedbackShared";

export {
  POST_WORKOUT_FEEDBACK_KEY,
  getPostWorkoutFeedbackTodayISO,
  safeParsePostWorkoutFeedback,
};

export type { MuscleTightness, PostWorkoutFeeling, PostWorkoutFeedbackPayload } from "./postWorkoutFeedbackShared";

export async function getStoredPostWorkoutFeedback(): Promise<PostWorkoutFeedbackPayload | null> {
  const jar = await cookies();
  return safeParsePostWorkoutFeedback(jar.get(POST_WORKOUT_FEEDBACK_KEY)?.value ?? null);
}

export async function getTodayPostWorkoutFeedback(): Promise<PostWorkoutFeedbackPayload | null> {
  const payload = await getStoredPostWorkoutFeedback();
  const today = getPostWorkoutFeedbackTodayISO();
  return payload && payload.date === today ? payload : null;
}

export async function getRelevantPostWorkoutFeedback(): Promise<PostWorkoutFeedbackPayload | null> {
  const payload = await getStoredPostWorkoutFeedback();
  if (!payload) return null;

  const today = getPostWorkoutFeedbackTodayISO();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = getPostWorkoutFeedbackTodayISO(yesterdayDate);

  return payload.date === today || payload.date === yesterday ? payload : null;
}
