import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import PMCChart from "@/components/PMCChart";
import RecoveryPanel from "@/components/RecoveryPanel";
import DataSourceBadge from "@/components/DataSourceBadge";
import { RECOVERY } from "@/lib/data";
import { getDashboardMetrics } from "@/lib/dashboardData";
import { getAthleteProfile } from "@/lib/athleteProfile";
import { getTrainingReadiness } from "@/lib/trainingDecision";

export const dynamic = "force-dynamic";

export default async function PmcPage() {
  const [{ pmcSeries, todayMetrics, source, connectionStatus, message }, athlete] = await Promise.all([
    getDashboardMetrics(),
    getAthleteProfile(),
  ]);

  const readiness = getTrainingReadiness({
    source,
    todayMetrics: source === "strava" ? todayMetrics : null,
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
      <Sidebar athlete={athlete} activeRoute="/pmc" />
      <main className="flex flex-col overflow-hidden">
        <Topbar title="PMC" date={dateLabel} readinessSignal={readiness.signal} readinessLabel={readiness.label} />
        <div className="flex-1 overflow-y-auto px-10 py-8 flex flex-col gap-5">
          <DataSourceBadge source={source} connectionStatus={connectionStatus} message={message} />
          <section className="grid gap-px" style={{ gridTemplateColumns: "1fr 340px" }}>
            <PMCChart data={pmcSeries} days={42} />
            <RecoveryPanel data={RECOVERY} />
          </section>
        </div>
      </main>
    </div>
  );
}
