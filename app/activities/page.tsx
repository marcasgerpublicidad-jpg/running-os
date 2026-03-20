import { getAthleteProfile }  from "@/lib/athleteProfile";
import { getDashboardMetrics } from "@/lib/dashboardData";
import Sidebar          from "@/components/Sidebar";
import ActivitiesClient from "@/components/ActivitiesClient";

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
  const [athlete, trainingData] = await Promise.all([getAthleteProfile(), getDashboardMetrics()]);

  return (
    <div className="ros-app-shell grid h-screen overflow-hidden" style={{ gridTemplateColumns: "248px 1fr" }}>
      <Sidebar athlete={athlete} activeRoute="/activities" />
      <ActivitiesClient
        activities={[...trainingData.activities].reverse()}
        source={trainingData.source}
        reason={trainingData.reason}
        connectionStatus={trainingData.connectionStatus}
        message={trainingData.message}
      />
    </div>
  );
}
