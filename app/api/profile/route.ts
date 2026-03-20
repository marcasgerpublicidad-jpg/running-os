import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ATHLETE_CONTEXT_KEY,
  resolveAthleteContext,
  safeParseAthleteContext,
  type AthleteContextPayload,
} from "@/lib/athleteContextShared";

export const dynamic = "force-dynamic";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 180,
};

export async function GET() {
  const jar = await cookies();
  const payload = safeParseAthleteContext(jar.get(ATHLETE_CONTEXT_KEY)?.value ?? null);
  return NextResponse.json({ profile: resolveAthleteContext(payload) });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<AthleteContextPayload>;
  const payload = safeParseAthleteContext(JSON.stringify({
    availabilityDays: body.availabilityDays,
    preferredIntensityModel: body.preferredIntensityModel,
    preferredSessionStyles: body.preferredSessionStyles,
    surfaceContext: body.surfaceContext,
    toleranceProfile: body.toleranceProfile,
    primaryGoalType: body.primaryGoalType,
    primaryGoalLabel: body.primaryGoalLabel,
    primaryGoalDate: body.primaryGoalDate,
    secondaryGoalType: body.secondaryGoalType,
    secondaryGoalLabel: body.secondaryGoalLabel,
    secondaryGoalDate: body.secondaryGoalDate,
    goalNotes: body.goalNotes,
    preferredQualityStyle: body.preferredQualityStyle,
    avoidClassicIntervals: body.avoidClassicIntervals,
    monthlyLongRunRule: body.monthlyLongRunRule,
    longRunDayPreference: body.longRunDayPreference,
    executionPreference: body.executionPreference,
    constraintNotes: body.constraintNotes,
    scheduleConstraints: body.scheduleConstraints,
    notes: body.notes,
    updatedAt: new Date().toISOString(),
  }));

  if (!payload) {
    return NextResponse.json({ error: "INVALID_PROFILE" }, { status: 400 });
  }

  const response = NextResponse.json({ profile: resolveAthleteContext(payload) });
  response.cookies.set(ATHLETE_CONTEXT_KEY, JSON.stringify(payload), {
    ...COOKIE_OPTS,
    httpOnly: false,
  });

  return response;
}
