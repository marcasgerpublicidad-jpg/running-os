/**
 * lib/strava.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Strava API client for Running OS.
 *
 * Covers the full OAuth 2.0 flow and activity fetching.
 * All network calls are isolated here — no Strava logic leaks into components.
 *
 * Strava API reference: https://developers.strava.com/docs/reference/
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Environment config ───────────────────────────────────────────────────────

/**
 * Read and validate required Strava environment variables at call-time
 * (not module-load time) so Next.js edge/server boundaries are respected.
 */
function stravaEnv() {
  const clientId     = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const redirectUri  = process.env.STRAVA_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Missing Strava environment variables. " +
      "Set STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, and STRAVA_REDIRECT_URI."
    );
  }

  return { clientId, clientSecret, redirectUri };
}

const STRAVA_BASE    = "https://www.strava.com";
const STRAVA_API     = `${STRAVA_BASE}/api/v3`;
const STRAVA_TOKEN   = `${STRAVA_BASE}/oauth/token`;

// ─── OAuth types ──────────────────────────────────────────────────────────────

export interface StravaTokenResponse {
  token_type:     string;
  expires_at:     number;   // Unix timestamp — when the access token expires
  expires_in:     number;   // seconds until expiry
  refresh_token:  string;
  access_token:   string;
  athlete:        StravaAthleteProfile;
}

export interface StravaAthleteProfile {
  id:         number;
  firstname:  string;
  lastname:   string;
  username:   string;
  profile:    string;  // avatar URL
  city:       string;
  country:    string;
}

// ─── Activity types (Strava raw shape) ───────────────────────────────────────

/** Raw Strava activity object (partial — only fields Running OS uses). */
export interface StravaRawActivity {
  id:                   number;
  name:                 string;
  type:                 string;   // "Run", "Ride", "Walk", etc.
  sport_type:           string;   // more granular since 2023 API
  start_date:           string;   // ISO 8601 UTC
  start_date_local:     string;   // ISO 8601 local
  distance:             number;   // metres
  moving_time:          number;   // seconds
  elapsed_time:         number;   // seconds
  total_elevation_gain: number;   // metres
  average_speed:        number;   // m/s
  max_speed:            number;   // m/s
  average_heartrate?:   number;   // bpm (requires activity:read_all or extended scope)
  max_heartrate?:       number;
  average_cadence?:     number;   // steps/min
  suffer_score?:        number;   // Strava's proprietary relative effort
  trainer:              boolean;
  manual:               boolean;
  has_heartrate:        boolean;
}

// ─── Normalized activity (Running OS internal format) ─────────────────────────

/**
 * Activity
 * ─────────────────────────────────────────────────────────────────────────────
 * Normalized representation of a training session inside Running OS.
 * All Strava-specific fields are mapped and converted to standard units.
 */
export interface Activity {
  id:                   number;
  name:                 string;
  type:                 string;
  date:                 string;   // "YYYY-MM-DD" local date
  distance:             number;   // km
  moving_time:          number;   // seconds
  moving_time_hours:    number;   // decimal hours (convenience)
  average_pace:         number;   // min/km
  total_elevation_gain: number;   // metres
  average_heartrate?:   number;   // bpm
  max_heartrate?:       number;   // bpm
  average_cadence?:     number;
  tss:                  number;   // calculated Training Stress Score
  intensity_factor:     number;   // 0–1+ scale
}

// ─── OAuth helpers ────────────────────────────────────────────────────────────

/**
 * buildStravaAuthUrl
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates the Strava OAuth authorization URL.
 * Redirect the user to this URL to start the OAuth flow.
 *
 * Scope "activity:read_all" is required to access private activities
 * and heart rate data.
 *
 * @param state - Optional CSRF token; stored in session and verified in callback.
 */
export function buildStravaAuthUrl(state?: string): string {
  const { clientId, redirectUri } = stravaEnv();

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: "code",
    approval_prompt: "auto",
    scope:         "read,activity:read_all",
    ...(state ? { state } : {}),
  });

  return `${STRAVA_BASE}/oauth/authorize?${params.toString()}`;
}

/**
 * exchangeCodeForToken
 * ─────────────────────────────────────────────────────────────────────────────
 * Exchanges a one-time authorization code (received in the OAuth callback)
 * for a long-lived access token + refresh token.
 *
 * Called once per authorization. Store the returned tokens securely
 * (e.g. encrypted in a database or httpOnly cookie).
 *
 * @param code - The authorization code from the Strava callback query string.
 */
export async function exchangeCodeForToken(code: string): Promise<StravaTokenResponse> {
  const { clientId, clientSecret } = stravaEnv();

  const res = await fetch(STRAVA_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id:     clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Strava token exchange failed (${res.status}): ${err}`);
  }

  return res.json() as Promise<StravaTokenResponse>;
}

/**
 * refreshAccessToken
 * ─────────────────────────────────────────────────────────────────────────────
 * Uses a refresh token to obtain a new access token when the current one
 * has expired (Strava access tokens expire after 6 hours).
 *
 * Call this before any API request if `expires_at < Date.now() / 1000`.
 *
 * @param refreshToken - The refresh token stored from a previous auth.
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<StravaTokenResponse> {
  const { clientId, clientSecret } = stravaEnv();

  const res = await fetch(STRAVA_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id:     clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type:    "refresh_token",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Strava token refresh failed (${res.status}): ${err}`);
  }

  return res.json() as Promise<StravaTokenResponse>;
}

/**
 * isTokenExpired
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns true if the access token has expired (with a 5-minute buffer).
 *
 * @param expiresAt - Unix timestamp from StravaTokenResponse.expires_at
 */
export function isTokenExpired(expiresAt: number): boolean {
  const BUFFER_SECONDS = 300; // 5 minutes
  return Date.now() / 1000 >= expiresAt - BUFFER_SECONDS;
}

// ─── Activity fetching ────────────────────────────────────────────────────────

/**
 * fetchStravaActivities
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches raw athlete activities from the Strava API.
 *
 * Strava returns max 200 activities per page. For athletes with more
 * than 200 activities in the requested window, use the `page` param.
 *
 * @param accessToken - Valid (non-expired) Strava access token.
 * @param options.after  - Unix timestamp. Only return activities after this date.
 * @param options.before - Unix timestamp. Only return activities before this date.
 * @param options.page   - Page number (default 1).
 * @param options.perPage - Items per page (max 200, default 60).
 */
export async function fetchStravaActivities(
  accessToken: string,
  options: {
    after?:   number;
    before?:  number;
    page?:    number;
    perPage?: number;
  } = {}
): Promise<StravaRawActivity[]> {
  const params = new URLSearchParams({
    page:     String(options.page    ?? 1),
    per_page: String(options.perPage ?? 60),
    ...(options.after  ? { after:  String(options.after)  } : {}),
    ...(options.before ? { before: String(options.before) } : {}),
  });

  const res = await fetch(`${STRAVA_API}/athlete/activities?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    // Next.js: revalidate every 30 minutes
    next: { revalidate: 1800 },
  });

  if (res.status === 401) {
    throw new Error("STRAVA_UNAUTHORIZED"); // Caller should refresh token and retry
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Strava activities fetch failed (${res.status}): ${err}`);
  }

  return res.json() as Promise<StravaRawActivity[]>;
}

/**
 * fetchStravaActivitiesLast90Days
 * ─────────────────────────────────────────────────────────────────────────────
 * Convenience wrapper: fetches all Run activities from the last 90 days.
 * 90 days covers the full CTL window (42 days) with buffer for seeding.
 *
 * Handles pagination automatically (up to 5 pages = 1000 activities).
 *
 * @param accessToken - Valid Strava access token.
 */
export async function fetchStravaActivitiesLast90Days(
  accessToken: string
): Promise<StravaRawActivity[]> {
  const after = Math.floor(Date.now() / 1000) - 90 * 24 * 60 * 60;
  const allActivities: StravaRawActivity[] = [];

  for (let page = 1; page <= 5; page++) {
    const batch = await fetchStravaActivities(accessToken, {
      after,
      page,
      perPage: 200,
    });

    allActivities.push(...batch);

    // If we got fewer than 200, there are no more pages
    if (batch.length < 200) break;
  }

  // Filter to running activities only
  return allActivities.filter(
    (a) => a.type === "Run" || a.sport_type === "Run" || a.sport_type === "TrailRun"
  );
}

// ─── Normalization ────────────────────────────────────────────────────────────

/**
 * normalizeActivity
 * ─────────────────────────────────────────────────────────────────────────────
 * Converts a raw Strava activity to Running OS's internal Activity format.
 *
 * Key conversions:
 *   - distance: metres → km
 *   - pace: m/s → min/km
 *   - date: ISO UTC string → "YYYY-MM-DD" local date
 *   - tss: calculated via calculateTSS (see lib/metrics.ts)
 *
 * @param raw - Raw activity from Strava API.
 */
export function normalizeActivity(raw: StravaRawActivity): Activity {
  const distanceKm     = raw.distance / 1000;
  const movingTimeHours = raw.moving_time / 3600;

  // Pace in min/km — guard against zero distance
  const avgPaceMinPerKm =
    distanceKm > 0
      ? raw.moving_time / 60 / distanceKm
      : 0;

  // Extract local date from start_date_local ("2026-03-10T08:30:00Z" → "2026-03-10")
  const date = raw.start_date_local.split("T")[0];

  // Calculate TSS using lib/metrics calculateTSS
  const { tss, intensityFactor } = calculateTSSFromActivity({
    movingTimeHours,
    avgPaceMinPerKm,
    averageHeartrate: raw.average_heartrate,
  });

  return {
    id:                   raw.id,
    name:                 raw.name,
    type:                 raw.sport_type || raw.type,
    date,
    distance:             Math.round(distanceKm * 100) / 100,
    moving_time:          raw.moving_time,
    moving_time_hours:    Math.round(movingTimeHours * 100) / 100,
    average_pace:         Math.round(avgPaceMinPerKm * 100) / 100,
    total_elevation_gain: raw.total_elevation_gain,
    average_heartrate:    raw.average_heartrate,
    max_heartrate:        raw.max_heartrate,
    average_cadence:      raw.average_cadence,
    tss,
    intensity_factor:     intensityFactor,
  };
}

/**
 * normalizeActivities
 * ─────────────────────────────────────────────────────────────────────────────
 * Normalizes an array of raw Strava activities.
 * Returns sorted oldest-first (required for PMC EMA calculation).
 */
export function normalizeActivities(raw: StravaRawActivity[]): Activity[] {
  return raw
    .map(normalizeActivity)
    .sort((a, b) => a.date.localeCompare(b.date)); // oldest first
}

// ─── TSS calculation (internal, called by normalizeActivity) ──────────────────

/**
 * calculateTSSFromActivity
 * ─────────────────────────────────────────────────────────────────────────────
 * Calculates TSS for a running activity using a simplified model.
 *
 * The gold-standard TSS formula requires a functional threshold pace (FTP)
 * or lactate threshold HR test. Without that data, we estimate intensity
 * from pace or heart rate.
 *
 * PACE-BASED METHOD (primary):
 *   Assumes an "average" runner's threshold pace of ~5:00 min/km.
 *   intensity_factor = threshold_pace / actual_pace
 *   (slower pace → lower IF; faster than threshold → IF > 1.0)
 *
 * HR-BASED METHOD (used when HR data available):
 *   Uses LTHR (lactate threshold heart rate) estimate of 165 bpm.
 *   intensity_factor = average_hr / lthr
 *   This is more accurate if the athlete has HR data.
 *
 * TSS FORMULA:
 *   TSS = duration_hours × intensity_factor² × 100
 *
 * A perfect hour at threshold = 100 TSS.
 * An easy 1-hour run at IF 0.75 = 56 TSS.
 * A hard 2-hour long run at IF 0.85 = 144 TSS.
 *
 * For production, replace THRESHOLD_PACE and LTHR with
 * athlete-specific values from their profile.
 */
function calculateTSSFromActivity(params: {
  movingTimeHours:  number;
  avgPaceMinPerKm:  number;
  averageHeartrate?: number;
}): { tss: number; intensityFactor: number } {
  const { movingTimeHours, avgPaceMinPerKm, averageHeartrate } = params;

  // Default thresholds — override with athlete profile data in production
  const THRESHOLD_PACE_MIN_PER_KM = 5.0;  // ~10km/h threshold pace
  const LTHR_BPM                  = 165;  // lactate threshold heart rate

  let intensityFactor: number;

  if (averageHeartrate && averageHeartrate > 0) {
    // HR-based IF (more accurate when HR data is available)
    intensityFactor = averageHeartrate / LTHR_BPM;
  } else if (avgPaceMinPerKm > 0) {
    // Pace-based IF: faster than threshold → IF > 1
    intensityFactor = THRESHOLD_PACE_MIN_PER_KM / avgPaceMinPerKm;
  } else {
    intensityFactor = 0.7; // conservative fallback for manual activities
  }

  // Clamp IF to a reasonable physiological range
  intensityFactor = Math.min(Math.max(intensityFactor, 0.3), 1.3);

  const tss = movingTimeHours * Math.pow(intensityFactor, 2) * 100;

  return {
    tss:             Math.round(tss * 10) / 10,
    intensityFactor: Math.round(intensityFactor * 1000) / 1000,
  };
}

// ─── Activities → TrainingDays ────────────────────────────────────────────────

/**
 * activitiesToTrainingDays
 * ─────────────────────────────────────────────────────────────────────────────
 * Converts a list of normalized activities into the TrainingDay[] format
 * required by buildMetricSeries() in lib/metrics.ts.
 *
 * Multiple activities on the same day are aggregated (TSS summed).
 * Days with no activity are filled with TSS = 0.
 *
 * @param activities - Normalized activities, oldest first.
 * @param fromDate   - Start of the window ("YYYY-MM-DD"). Default: 90 days ago.
 * @param toDate     - End of the window ("YYYY-MM-DD"). Default: today.
 */
export function activitiesToTrainingDays(
  activities: Activity[],
  fromDate?: string,
  toDate?: string
): import("./metrics").TrainingDay[] {
  // Build a date-keyed map of total TSS per day
  const tssMap: Record<string, number> = {};

  for (const activity of activities) {
    tssMap[activity.date] = (tssMap[activity.date] ?? 0) + activity.tss;
  }

  // Generate every day in the window
  const from = new Date(fromDate ?? daysAgo(90));
  const to   = new Date(toDate   ?? todayISO());
  const days: import("./metrics").TrainingDay[] = [];

  for (const d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().split("T")[0];
    days.push({ date: iso, tss: tssMap[iso] ?? 0 });
  }

  return days;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}
