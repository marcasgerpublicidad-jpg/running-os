import { resolveStravaToken } from "./stravaToken";
import type { Athlete } from "./data";
export interface AthleteProfile extends Athlete { photoUrl: string | null; city: string; country: string; isReal: boolean; }
const DEFAULT: AthleteProfile = { id:"demo", name:"Atleta", initials:"AT", goal:"Sub-4h · Maratón", currentCycle:"Ciclo base", currentWeek:8, totalWeeks:16, photoUrl:null, city:"", country:"", isReal:false };
export async function getAthleteProfile(): Promise<AthleteProfile> {
  const resolved = await resolveStravaToken();
  if (!resolved) return DEFAULT;
  try {
    const res = await fetch("https://www.strava.com/api/v3/athlete", { headers: { Authorization: `Bearer ${resolved.accessToken}` }, cache: "no-store" });
    if (!res.ok) return DEFAULT;
    const d = await res.json();
    return { id:String(d.id), name:`${d.firstname} ${d.lastname}`.trim(), initials:`${d.firstname?.[0]??''}${d.lastname?.[0]??''}`.toUpperCase(), goal:"Running OS · Atleta", currentCycle:"Ciclo base", currentWeek:8, totalWeeks:16, photoUrl:d.profile??d.profile_medium??null, city:d.city??"", country:d.country??"", isReal:true };
  } catch { return DEFAULT; }
}
