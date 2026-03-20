import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import DataSourceBadge from "@/components/DataSourceBadge";
import AthleteProfileForm from "@/components/AthleteProfileForm";
import AthleteContextSummary from "@/components/AthleteContextSummary";
import { RECOVERY } from "@/lib/data";
import { getDashboardMetrics } from "@/lib/dashboardData";
import { getAthleteProfile } from "@/lib/athleteProfile";
import { getAthleteContext } from "@/lib/athleteContext";
import { getPlanningHorizon } from "@/lib/planningHorizon";
import { getTrainingReadiness } from "@/lib/trainingDecision";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const [{ todayMetrics, source, connectionStatus, message }, athlete, athleteContext] = await Promise.all([
    getDashboardMetrics(),
    getAthleteProfile(),
    getAthleteContext(),
  ]);

  const readiness = getTrainingReadiness({
    source,
    todayMetrics: source === "strava" ? todayMetrics : null,
    hrvDeviation: RECOVERY.hrvDeviation,
  });
  const planningHorizon = getPlanningHorizon(athleteContext);

  const rawDate = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dateLabel = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

  return (
    <div className="ros-app-shell grid h-screen overflow-hidden" style={{ gridTemplateColumns: "248px 1fr" }}>
      <Sidebar athlete={athlete} activeRoute="/profile" />
      <main className="flex flex-col overflow-hidden">
        <Topbar title="Perfil del atleta" date={dateLabel} readinessSignal={readiness.signal} readinessLabel={readiness.label} />
        <div className="flex-1 overflow-y-auto px-10 py-8 flex flex-col gap-5">
          <DataSourceBadge source={source} connectionStatus={connectionStatus} message={message} />
          <AthleteContextSummary profile={athleteContext} horizon={planningHorizon} />
          <AthleteProfileForm initialProfile={athleteContext} />
        </div>
      </main>
    </div>
  );
}
