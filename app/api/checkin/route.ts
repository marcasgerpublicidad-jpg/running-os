import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CHECKIN_KEY, getTodayCheckIn, safeParseCheckIn, type CheckInPayload } from "@/lib/checkin";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    checkIn: await getTodayCheckIn(),
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json().catch(() => null);
  const payload = safeParseCheckIn(JSON.stringify(body));

  if (!payload) {
    return NextResponse.json(
      { error: "INVALID_CHECKIN", message: "Payload de check-in inválido." },
      { status: 400 }
    );
  }

  const jar = await cookies();
  jar.set(CHECKIN_KEY, JSON.stringify(payload satisfies CheckInPayload), {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  return NextResponse.json({ ok: true, checkIn: payload });
}
