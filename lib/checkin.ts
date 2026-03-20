import "server-only";

import { cookies } from "next/headers";
import { CHECKIN_KEY, getCheckInTodayISO, safeParseCheckIn, type CheckInPayload } from "./checkinShared";

export { CHECKIN_KEY, getCheckInTodayISO, safeParseCheckIn };
export type { CheckInMode, CheckInPayload, QuickCheckInStatus } from "./checkinShared";

export async function getStoredCheckIn(): Promise<CheckInPayload | null> {
  const jar = await cookies();
  return safeParseCheckIn(jar.get(CHECKIN_KEY)?.value ?? null);
}

export async function getTodayCheckIn(): Promise<CheckInPayload | null> {
  const payload = await getStoredCheckIn();
  const today = getCheckInTodayISO();
  return payload && payload.date === today ? payload : null;
}
