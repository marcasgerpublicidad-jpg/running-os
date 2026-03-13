import Sidebar         from "@/components/Sidebar";
import Topbar          from "@/components/Topbar";
import MetricCard      from "@/components/MetricCard";
import PMCChart        from "@/components/PMCChart";
import RecoveryPanel   from "@/components/RecoveryPanel";
import WeeklyPlan      from "@/components/WeeklyPlan";
import AlertsPanel     from "@/components/AlertsPanel";
import NextSession     from "@/components/NextSession";
import DataSourceBadge from "@/components/DataSourceBadge";
import { RECOVERY, WEEKLY_PLAN, NEXT_SESSION } from "@/lib/data";
import { getReadinessStatus } from "@/lib/metrics";
import { getDashboardMetrics } from "@/lib/dashboardData";
import { getAthleteProfile }   from "@/lib/athleteProfile";
import { generateAlerts }      from "@/lib/alerts";
import type { DailyMetrics }   from "@/lib/metrics";

export default async function DashboardPage() {
  const [{ pmcSeries, todayMetrics, source, isConnected }, athlete] =
    await Promise.all([getDashboardMetrics(), getAthleteProfile()]);
  const readiness = getReadinessStatus(todayMetrics.tsb, RECOVERY.hrvDeviation);
  const alerts    = generateAlerts(todayMetrics, RECOVERY);
  const rawDate   = new Date().toLocaleDateString("es-AR", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
  const dateLabel = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);
  return (
    <div className="grid h-screen overflow-hidden" style={{ gridTemplateColumns: "220px 1fr" }}>
      <Sidebar athlete={athlete} activeRoute="/dashboard" />
      <main className="flex flex-col overflow-hidden">
        <Topbar title="Dashboard" date={dateLabel} readinessSignal={readiness.signal} readinessLabel={readiness.label} isStravaConnected={isConnected} />
        <div className="flex-1 overflow-y-auto px-8 py-7 flex flex-col gap-5">
          <DataSourceBadge source={source} />
          <section className="grid grid-cols-4 gap-px">
            <MetricCard label="ATL · Fatiga aguda"  value={Math.round(todayMetrics.atl)} unit="TSS" delta={computeDelta(pmcSeries,"atl",7)}  deltaColor="red"   description={"Carga últimos 7 días.\nRango aceptable: 40–85"} accent="red" />
            <MetricCard label="CTL · Forma crónica" value={Math.round(todayMetrics.ctl)} unit="TSS" delta={computeDelta(pmcSeries,"ctl",28)} deltaColor="blue"  description={"Carga últimos 42 días.\nObjetivo: 80+ en 3 sem"} accent="blue" />
            <MetricCard label="TSB · Forma deportiva" value={Math.round(todayMetrics.tsb)} unit="pts" delta={`● ${readiness.label}`} deltaColor="green" description={"CTL − ATL. Zona óptima:\n−10 a +10 para competir"} accent="green" />
            <MetricCard label="HRV · Variabilidad"  value={RECOVERY.hrv} unit="ms" delta={`↓ ${RECOVERY.hrvDeviation} vs baseline`} deltaColor="amber" description={`Promedio nocturno.\nTu baseline: ${RECOVERY.hrvBaseline}ms`} accent="amber" />
          </section>
          <section className="grid gap-px" style={{ gridTemplateColumns: "1fr 340px" }}>
            <PMCChart data={pmcSeries} days={42} />
            <RecoveryPanel data={RECOVERY} />
          </section>
          <section className="grid grid-cols-3 gap-px">
            <WeeklyPlan days={WEEKLY_PLAN} />
            <AlertsPanel alerts={alerts} />
            <NextSession session={NEXT_SESSION} />
          </section>
        </div>
      </main>
    </div>
  );
}
function computeDelta(series: DailyMetrics[], key: "atl"|"ctl", lookback: number): string {
  if (series.length < 2) return "—";
  const now  = series[series.length - 1][key];
  const prev = series[Math.max(0, series.length - 1 - lookback)][key];
  const diff = now - prev;
  return `${diff >= 0 ? "+" : ""}${diff.toFixed(1)} (${lookback}d)`;
}
