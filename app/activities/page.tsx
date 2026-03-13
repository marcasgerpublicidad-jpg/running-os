import { resolveStravaToken } from "@/lib/stravaToken";
import { getAthleteProfile }  from "@/lib/athleteProfile";
import { fetchStravaActivities, normalizeActivities, type Activity } from "@/lib/strava";
import Sidebar          from "@/components/Sidebar";
import ActivitiesClient from "@/components/ActivitiesClient";

export default async function ActivitiesPage() {
  const [athlete, resolved] = await Promise.all([getAthleteProfile(), resolveStravaToken()]);
  let activities: Activity[] = [];
  let error: string | null = null;

  if (resolved) {
    try {
      const raw = await fetchStravaActivities(resolved.accessToken, { perPage: 200, page: 1 });
      activities = normalizeActivities(raw).reverse();
    } catch (e) {
      error = e instanceof Error ? e.message : "Error al cargar actividades";
    }
  } else {
    error = "NOT_CONNECTED";
  }

  return (
    <div className="grid h-screen overflow-hidden" style={{ gridTemplateColumns: "220px 1fr" }}>
      <Sidebar athlete={athlete} activeRoute="/activities" />
      <ActivitiesClient activities={activities} error={error} />
    </div>
  );
}
