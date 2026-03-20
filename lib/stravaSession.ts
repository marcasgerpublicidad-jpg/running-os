/**
 * lib/stravaSession.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Server-side Strava token session management using Next.js cookies.
 *
 * Tokens are stored in httpOnly, secure cookies — never exposed to the client.
 *
 * Cookie design:
 *   strava_access_token   — short-lived (6h), used for API calls
 *   strava_refresh_token  — long-lived, used to get new access tokens
 *   strava_expires_at     — Unix timestamp, used to detect expiry
 *   strava_athlete_id     — numeric athlete ID (non-sensitive)
 *
 * In production, consider encrypting the refresh token at rest.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { cookies } from "next/headers";
import {
  refreshAccessToken,
  isTokenExpired,
  type StravaTokenResponse,
} from "./strava";

const COOKIE_ACCESS_TOKEN  = "strava_access_token";
const COOKIE_REFRESH_TOKEN = "strava_refresh_token";
const COOKIE_EXPIRES_AT    = "strava_expires_at";
const COOKIE_ATHLETE_ID    = "strava_athlete_id";

const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path:     "/",
};

// ─── Save / clear ─────────────────────────────────────────────────────────────

/**
 * saveStravaSession
 * Persists all token data from a Strava token response to httpOnly cookies.
 */
export async function saveStravaSession(token: StravaTokenResponse): Promise<void> {
  const jar = await cookies();

  jar.set(COOKIE_ACCESS_TOKEN,  token.access_token,          { ...COOKIE_OPTS, maxAge: token.expires_in });
  jar.set(COOKIE_REFRESH_TOKEN, token.refresh_token,          { ...COOKIE_OPTS, maxAge: 60 * 60 * 24 * 180 }); // 180 days
  jar.set(COOKIE_EXPIRES_AT,    String(token.expires_at),     { ...COOKIE_OPTS, maxAge: 60 * 60 * 24 * 180 });
  jar.set(COOKIE_ATHLETE_ID,    String(token.athlete?.id ?? ""), { ...COOKIE_OPTS, maxAge: 60 * 60 * 24 * 180 });
}

/**
 * clearStravaSession
 * Removes all Strava-related cookies (used on disconnect / sign-out).
 */
export async function clearStravaSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_ACCESS_TOKEN);
  jar.delete(COOKIE_REFRESH_TOKEN);
  jar.delete(COOKIE_EXPIRES_AT);
  jar.delete(COOKIE_ATHLETE_ID);
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export interface StravaSession {
  accessToken:  string;
  refreshToken: string;
  expiresAt:    number;
  athleteId:    string;
}

/**
 * getStravaSession
 * Reads raw session data from cookies. Returns null if not connected.
 */
export async function getStravaSession(): Promise<StravaSession | null> {
  const jar = await cookies();

  const accessToken  = jar.get(COOKIE_ACCESS_TOKEN)?.value;
  const refreshToken = jar.get(COOKIE_REFRESH_TOKEN)?.value;
  const expiresAtStr = jar.get(COOKIE_EXPIRES_AT)?.value;
  const athleteId    = jar.get(COOKIE_ATHLETE_ID)?.value;

  if (!refreshToken || !expiresAtStr) return null;

  return {
    accessToken:  accessToken ?? "",
    refreshToken,
    expiresAt:    parseInt(expiresAtStr, 10),
    athleteId:    athleteId ?? "",
  };
}

/**
 * getValidAccessToken
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns a valid (non-expired) access token, refreshing automatically
 * if the current one has expired.
 *
 * This is the primary function API routes should call before hitting Strava.
 *
 * @returns The access token string, or null if user is not connected.
 */
export async function getValidAccessToken(): Promise<string | null> {
  const session = await getStravaSession();
  if (!session) {
    return null;
  }

  // Token is still valid — return it directly
  if (session.accessToken && !isTokenExpired(session.expiresAt)) {
    return session.accessToken;
  }

  // Token expired — use refresh token to get a new one
  try {
    const refreshed = await refreshAccessToken(session.refreshToken);
    await saveStravaSession(refreshed);
    return refreshed.access_token;
  } catch {
    // Refresh token itself is invalid/revoked.
    // Don't mutate cookies here because this helper is also used from
    // server-rendered pages, where cookie writes are not allowed.
    return null;
  }
}

/**
 * isStravaConnected
 * Quick check — true if a refresh token exists (user has connected Strava).
 */
export async function isStravaConnected(): Promise<boolean> {
  const session = await getStravaSession();
  return session !== null;
}
