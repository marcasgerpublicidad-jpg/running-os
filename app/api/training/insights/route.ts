import { NextResponse } from "next/server";
import { getReadinessStatus } from "@/lib/metrics";
import { RECOVERY } from "@/lib/data";
import { toTrainingDataApiPayload, getDashboardMetrics } from "@/lib/dashboardData";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const data = await getDashboardMetrics();
  const readiness = getReadinessStatus(data.todayMetrics.tsb, RECOVERY.hrvDeviation);

  return NextResponse.json({
    ...toTrainingDataApiPayload(data),
    insights: {
      readiness,
      todayTss: data.todayMetrics.tss,
      todayAtl: data.todayMetrics.atl,
      todayCtl: data.todayMetrics.ctl,
      todayTsb: data.todayMetrics.tsb,
    },
  });
}
