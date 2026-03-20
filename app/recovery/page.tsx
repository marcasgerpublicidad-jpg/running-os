import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import RecoveryPanel from "@/components/RecoveryPanel";
import DataSourceBadge from "@/components/DataSourceBadge";
import AthleteContextSummary from "@/components/AthleteContextSummary";
import PostSessionRecoveryCard from "@/components/PostSessionRecoveryCard";
import PostWorkoutFeedbackForm from "@/components/PostWorkoutFeedbackForm";
import PostWorkoutFeedbackStatus from "@/components/PostWorkoutFeedbackStatus";
import { RECOVERY } from "@/lib/data";
import { getDashboardMetrics } from "@/lib/dashboardData";
import { getAthleteProfile } from "@/lib/athleteProfile";
import { getAthleteContext } from "@/lib/athleteContext";
import { getRelevantPostWorkoutFeedback, getTodayPostWorkoutFeedback } from "@/lib/postWorkoutFeedback";
import { buildDailyTrainingDecision } from "@/lib/trainingDecision";
import { getTrainingReadiness } from "@/lib/trainingDecision";

export const dynamic = "force-dynamic";

export default async function RecoveryPage() {
  const [{ todayMetrics, source, connectionStatus, message }, athlete, athleteContext, feedback, relevantFeedback] = await Promise.all([
    getDashboardMetrics(),
    getAthleteProfile(),
    getAthleteContext(),
    getTodayPostWorkoutFeedback(),
    getRelevantPostWorkoutFeedback(),
  ]);

  const readiness = getTrainingReadiness({
    source,
    todayMetrics: source === "strava" ? todayMetrics : null,
    hrvDeviation: RECOVERY.hrvDeviation,
  });
  const trainingDecision = buildDailyTrainingDecision({
    checkIn: null,
    postWorkoutFeedback: relevantFeedback,
    athleteContext,
    todayMetrics: source === "strava" ? todayMetrics : null,
    source,
    hrvDeviation: RECOVERY.hrvDeviation,
  });
  const rawDate = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dateLabel = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

  return (
    <div className="ros-app-shell grid h-screen overflow-hidden" style={{ gridTemplateColumns: "248px 1fr" }}>
      <Sidebar athlete={athlete} activeRoute="/recovery" />
      <main className="flex flex-col overflow-hidden">
        <Topbar title="Recuperación" date={dateLabel} readinessSignal={readiness.signal} readinessLabel={readiness.label} />
        <div className="flex-1 overflow-y-auto px-10 py-8 flex flex-col gap-5">
          <DataSourceBadge source={source} connectionStatus={connectionStatus} message={message} />
          <AthleteContextSummary profile={athleteContext} horizon={trainingDecision.planningHorizon} />
          <PostSessionRecoveryCard recovery={trainingDecision.postSessionRecovery} />
          <PostWorkoutFeedbackStatus initialFeedback={feedback} />
          <PostWorkoutFeedbackForm initialFeedback={feedback} />
          <RecoveryPanel data={RECOVERY} />
        </div>
      </main>
    </div>
  );
}
