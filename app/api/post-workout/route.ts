import { NextRequest, NextResponse } from "next/server";
import {
  POST_WORKOUT_FEEDBACK_KEY,
  getTodayPostWorkoutFeedback,
  safeParsePostWorkoutFeedback,
  type PostWorkoutFeedbackPayload,
} from "@/lib/postWorkoutFeedback";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    feedback: await getTodayPostWorkoutFeedback(),
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json().catch(() => null);
  const payload = safeParsePostWorkoutFeedback(JSON.stringify(body));

  if (!payload) {
    return NextResponse.json(
      { error: "INVALID_POST_WORKOUT_FEEDBACK", message: "Payload post-entreno inválido." },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ ok: true, feedback: payload });
  response.cookies.set(POST_WORKOUT_FEEDBACK_KEY, JSON.stringify(payload satisfies PostWorkoutFeedbackPayload), {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  return response;
}
