import Sidebar         from "@/components/Sidebar";
import Topbar          from "@/components/Topbar";
import MetricCard      from "@/components/MetricCard";
import PMCChart        from "@/components/PMCChart";
import RecoveryPanel   from "@/components/RecoveryPanel";
import WeeklyPlan      from "@/components/WeeklyPlan";
import AlertsPanel     from "@/components/AlertsPanel";
import NextSession     from "@/components/NextSession";
import DataSourceBadge from "@/components/DataSourceBadge";
import PreSessionActivationCard from "@/components/PreSessionActivationCard";
import PostSessionRecoveryCard from "@/components/PostSessionRecoveryCard";
import PlanningHorizonPanel from "@/components/PlanningHorizonPanel";
import { RECOVERY, WEEKLY_PLAN, NEXT_SESSION } from "@/lib/data";
import { getDashboardMetrics } from "@/lib/dashboardData";
import { getAthleteProfile }   from "@/lib/athleteProfile";
import { generateAlerts }      from "@/lib/alerts";
import type { DailyMetrics }   from "@/lib/metrics";
import CheckInStatus          from "@/components/CheckInStatus";
import AthleteContextSummary from "@/components/AthleteContextSummary";
import { getTodayCheckIn } from "@/lib/checkin";
import { getAthleteContext } from "@/lib/athleteContext";
import { getRelevantPostWorkoutFeedback } from "@/lib/postWorkoutFeedback";
import { buildDailyTrainingDecision } from "@/lib/trainingDecision";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [{ pmcSeries, todayMetrics, source, connectionStatus, reason, message }, athlete, checkIn, athleteContext, postWorkoutFeedback] =
    await Promise.all([getDashboardMetrics(), getAthleteProfile(), getTodayCheckIn(), getAthleteContext(), getRelevantPostWorkoutFeedback()]);
  const hasLiveTrainingData = source === "strava";
  const trainingDecision = buildDailyTrainingDecision({
    checkIn,
    postWorkoutFeedback,
    athleteContext,
    todayMetrics: hasLiveTrainingData ? todayMetrics : null,
    source,
    reason,
    hrvDeviation: RECOVERY.hrvDeviation,
    baseWeeklyPlan: WEEKLY_PLAN,
    baseNextSession: NEXT_SESSION,
  });
  const readiness = trainingDecision.dailyRecommendation.readiness;
  const alerts = hasLiveTrainingData
    ? generateAlerts(todayMetrics, RECOVERY)
    : [{
        id: "training-data-unavailable",
        level: source === "fallback" ? "amber" as const : "blue" as const,
        title: source === "fallback" ? "Sincronización parcial." : "Strava sin conexión.",
        body: message ?? "No hay datos reales disponibles para evaluar carga y forma hoy.",
        time: "Estado actual",
      }];
  const trainingStatusTitle = hasLiveTrainingData
    ? null
    : source === "not_connected"
      ? "Conectá Strava para ver forma y carga reales"
      : "Mostrando dashboard operativo con fallback activo";
  const rawDate   = new Date().toLocaleDateString("es-AR", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
  const dateLabel = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);
  return (
    <div className="ros-app-shell grid h-screen overflow-hidden" style={{ gridTemplateColumns: "248px 1fr" }}>
      <Sidebar athlete={athlete} activeRoute="/dashboard" />
      <main className="flex flex-col overflow-hidden">
        <Topbar title="Dashboard" date={dateLabel} readinessSignal={readiness.signal} readinessLabel={readiness.label} />
        <div className="flex-1 overflow-y-auto px-10 py-8 flex flex-col gap-5">
          <section className="grid gap-5 xl:grid-cols-[1.28fr_0.92fr]">
            <div className="flex flex-col gap-5">
              <div className="ros-hero-panel">
                <div className="relative flex flex-col gap-3">
                  <span className="ros-kicker">Capa operativa del atleta</span>
                  <h2 className="max-w-[12ch] font-sans text-[42px] font-semibold tracking-[-0.08em] text-ros-bright leading-[0.94]">
                    {trainingDecision.recommendationTitle}
                  </h2>
                  <p className="max-w-[58ch] font-sans text-[15px] leading-7 text-ros-muted">
                    {trainingDecision.recommendationBody}
                  </p>
                  <p className="max-w-[48ch] font-sans text-[13px] leading-6 text-ros-mid">
                    La sesión de hoy respeta la estructura semanal y toma el contexto real del atleta como capa de interpretación.
                  </p>
                </div>
              </div>
              <PlanningHorizonPanel horizon={trainingDecision.planningHorizon} compact />
            </div>
            <div className="flex flex-col gap-5">
              <DataSourceBadge source={source} connectionStatus={connectionStatus} message={message} />
              <CheckInStatus initialCheckIn={checkIn} />
              <AthleteContextSummary
                profile={athleteContext}
                horizon={trainingDecision.planningHorizon}
                compact
              />
            </div>
          </section>
          {!hasLiveTrainingData ? (
            <section className="ros-panel-muted px-5 py-4">
              <div className="relative flex flex-col gap-3">
                <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-amber-300 mb-1">
                  {trainingStatusTitle}
                </div>
                <div className="font-sans text-sm text-ros-muted">
                  {message ?? "La conexión con Strava no está disponible. El dashboard sigue operativo, pero la carga y la forma no representan datos reales del atleta."}
                </div>
              </div>
            </section>
          ) : null}
          <section className="grid grid-cols-4 gap-px">
            <MetricCard label="ATL · Fatiga aguda"  value={hasLiveTrainingData ? Math.round(todayMetrics.atl) : "—"} unit={hasLiveTrainingData ? "TSS" : ""} delta={hasLiveTrainingData ? computeDelta(pmcSeries,"atl",7) : "Sin datos reales"}  deltaColor="red"   description={hasLiveTrainingData ? "Carga últimos 7 días.\nRango aceptable: 40–85" : "Disponible cuando Strava esté conectada.\nNo mostramos un valor ambiguo."} accent="red" dimmed={!hasLiveTrainingData} />
            <MetricCard label="CTL · Forma crónica" value={hasLiveTrainingData ? Math.round(todayMetrics.ctl) : "—"} unit={hasLiveTrainingData ? "TSS" : ""} delta={hasLiveTrainingData ? computeDelta(pmcSeries,"ctl",28) : "Sin datos reales"} deltaColor="blue"  description={hasLiveTrainingData ? "Carga últimos 42 días.\nObjetivo: 80+ en 3 sem" : "Disponible cuando Strava esté conectada.\nNo mostramos un valor ambiguo."} accent="blue" dimmed={!hasLiveTrainingData} />
            <MetricCard label="TSB · Forma deportiva" value={hasLiveTrainingData ? Math.round(todayMetrics.tsb) : "—"} unit={hasLiveTrainingData ? "pts" : ""} delta={hasLiveTrainingData ? `● ${readiness.label}` : "Estado limitado"} deltaColor="green" description={hasLiveTrainingData ? "CTL − ATL. Zona óptima:\n−10 a +10 para competir" : "La forma depende de datos reales de carga.\nNo inferimos un TSB sin conexión."} accent="green" dimmed={!hasLiveTrainingData} />
            <MetricCard label="HRV · Variabilidad"  value={RECOVERY.hrv} unit="ms" delta={`↓ ${RECOVERY.hrvDeviation} vs baseline`} deltaColor="amber" description={`Promedio nocturno.\nTu baseline: ${RECOVERY.hrvBaseline}ms`} accent="amber" />
          </section>
          <section className="grid gap-px" style={{ gridTemplateColumns: "1fr 340px" }}>
            <PMCChart
              data={hasLiveTrainingData ? pmcSeries : []}
              days={42}
              emptyStateTitle={source === "not_connected" ? "PMC sin conexión" : "PMC en fallback"}
              emptyStateMessage={message ?? "No hay datos válidos para construir el PMC de forma confiable."}
            />
            <RecoveryPanel data={RECOVERY} />
          </section>
          <WeeklyPlan days={trainingDecision.weeklyPlan} variant="compact" />
          <PreSessionActivationCard activation={trainingDecision.preSessionActivation} />
          <PostSessionRecoveryCard recovery={trainingDecision.postSessionRecovery} />
          <section className="grid gap-5 xl:grid-cols-2">
            <div>
              <AlertsPanel alerts={alerts} />
            </div>
            <NextSession
              session={trainingDecision.nextSession}
              title="Recomendación del día"
              note={trainingDecision.translatedStimulusNote}
            />
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
