import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import DataSourceBadge from "@/components/DataSourceBadge";
import { RECOVERY } from "@/lib/data";
import { getDashboardMetrics } from "@/lib/dashboardData";
import { getAthleteProfile } from "@/lib/athleteProfile";
import CheckInForm from "@/components/CheckInForm";
import CheckInStatus from "@/components/CheckInStatus";
import { getTodayCheckIn } from "@/lib/checkin";
import { getTrainingReadiness } from "@/lib/trainingDecision";

export const dynamic = "force-dynamic";

export default async function CheckInPage() {
  const [{ todayMetrics, source, connectionStatus, message }, athlete, checkIn] = await Promise.all([
    getDashboardMetrics(),
    getAthleteProfile(),
    getTodayCheckIn(),
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
      <Sidebar athlete={athlete} activeRoute="/checkin" />
      <main className="flex flex-col overflow-hidden">
        <Topbar title="Check-in" date={dateLabel} readinessSignal={readiness.signal} readinessLabel={readiness.label} />
        <div className="flex-1 overflow-y-auto px-10 py-8 flex flex-col gap-5">
          <DataSourceBadge source={source} connectionStatus={connectionStatus} message={message} />
          <CheckInStatus initialCheckIn={checkIn} />
          <div className="ros-panel-muted px-5 py-4">
            <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-ros-mid mb-1">
              Nueva jerarquía de señales
            </div>
            <div className="font-sans text-sm text-ros-muted leading-6">
              Primero pesan las señales automáticas y el feedback post-entreno reciente. El pre-check-in rápido ahora sólo ajusta fino el día actual y el override manual queda como capa final.
            </div>
          </div>
          <CheckInForm initialCheckIn={checkIn} />
        </div>
      </main>
    </div>
  );
}
