import { getValidAccessToken } from "./stravaSession";
interface TokenCache { accessToken: string; expiresAt: number; }
let _cache: TokenCache | null = null;
const BUFFER_SECS = 300;
export type TokenSource = "oauth_cookie" | "env_static" | "env_refresh" | null;
export interface ResolvedToken { accessToken: string; source: TokenSource; }
export async function resolveStravaToken(): Promise<ResolvedToken | null> {
  try {
    const token = await getValidAccessToken();
    if (token) {
      return { accessToken: token, source: "oauth_cookie" };
    }
  } catch {}
  if (process.env.STRAVA_ACCESS_TOKEN) return { accessToken: process.env.STRAVA_ACCESS_TOKEN, source: "env_static" };
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  if (!refreshToken || !clientId || !clientSecret) {
    return null;
  }
  const now = Date.now() / 1000;
  if (_cache && now < _cache.expiresAt - BUFFER_SECS) {
    return { accessToken: _cache.accessToken, source: "env_refresh" };
  }
  try {
    const res = await fetch("https://www.strava.com/oauth/token", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" }), cache: "no-store" });
    if (!res.ok) { console.error("[stravaToken] Refresh falló", res.status, await res.text()); return null; }
    const data = await res.json();
    if (!data.access_token || !data.expires_at) return null;
    _cache = { accessToken: data.access_token, expiresAt: data.expires_at };
    return { accessToken: data.access_token, source: "env_refresh" };
  } catch (err) { console.error("[stravaToken] Error:", err); return null; }
}
export function isStravaConfigured(): boolean {
  return !!(process.env.STRAVA_ACCESS_TOKEN || (process.env.STRAVA_REFRESH_TOKEN && process.env.STRAVA_CLIENT_ID && process.env.STRAVA_CLIENT_SECRET));
}
