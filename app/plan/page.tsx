import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import WeeklyPlan from "@/components/WeeklyPlan";
import DataSourceBadge from "@/components/DataSourceBadge";
import CheckInStatus from "@/components/CheckInStatus";
import AthleteContextSummary from "@/components/AthleteContextSummary";
import PreSessionActivationCard from "@/components/PreSessionActivationCard";
import PlanningHorizonPanel from "@/components/PlanningHorizonPanel";
import { RECOVERY, WEEKLY_PLAN } from "@/lib/data";
import { getDashboardMetrics } from "@/lib/dashboardData";
import { getAthleteProfile } from "@/lib/athleteProfile";
import { getTodayCheckIn } from "@/lib/checkin";
import { getAthleteContext } from "@/lib/athleteContext";
import { getRelevantPostWorkoutFeedback } from "@/lib/postWorkoutFeedback";
import { buildDailyTrainingDecision } from "@/lib/trainingDecision";

export const dynamic = "force-dynamic";

export default async function PlanPage() {
  const [{ todayMetrics, source, connectionStatus, message }, athlete, checkIn, athleteContext, postWorkoutFeedback] = await Promise.all([
    getDashboardMetrics(),
    getAthleteProfile(),
    getTodayCheckIn(),
    getAthleteContext(),
    getRelevantPostWorkoutFeedback(),
  ]);

  const trainingDecision = buildDailyTrainingDecision({
    checkIn,
    postWorkoutFeedback,
    athleteContext,
    todayMetrics: source === "strava" ? todayMetrics : null,
    source,
    hrvDeviation: RECOVERY.hrvDeviation,
    baseWeeklyPlan: WEEKLY_PLAN,
  });
  const readiness = trainingDecision.dailyRecommendation.readiness;
  const rawDate = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dateLabel = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

  return (
    <div className="ros-app-shell grid h-screen overflow-hidden" style={{ gridTemplateColumns: "248px 1fr" }}>
      <Sidebar athlete={athlete} activeRoute="/plan" />
      <main className="flex flex-col overflow-hidden">
        <Topbar title="Plan semanal" date={dateLabel} readinessSignal={readiness.signal} readinessLabel={readiness.label} />
        <div className="flex-1 overflow-y-auto px-10 py-8 flex flex-col gap-5">
          <WeeklyPlan days={trainingDecision.weeklyPlan} variant="full" />
          <DataSourceBadge source={source} connectionStatus={connectionStatus} message={message} />
          <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-5">
              <div className="ros-panel-muted px-6 py-5">
                <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-ros-mid mb-1">
                  Estructura + ajuste diario
                </div>
                <div className="font-sans text-sm text-ros-muted">
                  {trainingDecision.dailyRecommendation.body}
                </div>
                <div className="mt-3 font-sans text-sm text-ros-text">
                  Forma sugerida del estímulo hoy: {trainingDecision.nextSession.type}
                </div>
                <div className="font-sans text-sm text-ros-muted mt-2">
                  {trainingDecision.translatedStimulusNote}
                </div>
                <div className="font-mono text-[10px] text-ros-faint tracking-[0.08em] mt-3">
                  Base semanal intacta. Modificación aplicada hoy: {trainingDecision.dailyModification.adjustment}
                </div>
              </div>

              <PreSessionActivationCard activation={trainingDecision.preSessionActivation} compact />
            </div>

            <div className="grid gap-5">
              <CheckInStatus initialCheckIn={checkIn} />
              <AthleteContextSummary profile={athleteContext} horizon={trainingDecision.planningHorizon} compact />
              <PlanningHorizonPanel horizon={trainingDecision.planningHorizon} compact />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
