import { NextResponse } from "next/server";
import { toTrainingDataApiPayload, getDashboardMetrics } from "@/lib/dashboardData";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const data = getDashboardMetrics();

  return NextResponse.json(toTrainingDataApiPayload(await data));
}
