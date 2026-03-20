# Running OS — Next.js Codebase

The operating system for endurance athletes.

---

## Stack

| Tool       | Version | Purpose                  |
|------------|---------|--------------------------|
| Next.js    | 14 (App Router) | Framework          |
| TypeScript | 5       | Type safety              |
| Tailwind   | 3.4     | Styling                  |
| Recharts   | 2.12    | PMC chart                |
| Strava API | v3      | Activity data source     |

---

## Project Structure

```
running-os/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx                          # Redirects → /dashboard
│   ├── connect/
│   │   └── page.tsx                      # Strava OAuth connect screen
│   ├── dashboard/
│   │   └── page.tsx                      # Main dashboard (Server Component)
│   └── api/
│       ├── auth/strava/route.ts          # OAuth Step 1: redirect to Strava
│       └── strava/
│           ├── callback/route.ts         # OAuth Step 2: exchange code → tokens
│           ├── activities/route.ts       # GET activities + PMC data
│           └── disconnect/route.ts       # POST: clear session cookies
│
├── components/
│   ├── Logo.tsx
│   ├── Sidebar.tsx
│   ├── Topbar.tsx
│   ├── MetricCard.tsx
│   ├── PMCChart.tsx
│   ├── RecoveryPanel.tsx
│   ├── WeeklyPlan.tsx
│   ├── AlertsPanel.tsx
│   ├── NextSession.tsx
│   └── DataSourceBadge.tsx              # Shows "Live · Strava" or "Demo"
│
├── lib/
│   ├── metrics.ts                        # ATL, CTL, TSB, calculateTSS
│   ├── strava.ts                         # Strava API client + normalization
│   ├── stravaSession.ts                  # Token storage (httpOnly cookies)
│   ├── dashboardData.ts                  # Strava-or-demo data resolver
│   ├── alerts.ts                         # Dynamic alert generator
│   └── data.ts                           # Static placeholder data
│
├── .env.local.example                    # Environment variable template
└── .gitignore
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_REDIRECT_URI=http://localhost:3000/api/auth/strava/callback
```

### 3. Create a Strava app

1. Go to **https://www.strava.com/settings/api**
2. Click **"Create & Manage Your App"**
3. Fill in:
   - **Application Name**: Running OS
   - **Category**: Training
   - **Authorization Callback Domain**: `localhost`
4. Copy **Client ID** and **Client Secret** into `.env.local`

### 4. Run the dev server

```bash
npm run dev
# → http://localhost:3000
```

### 5. Connect Strava

Navigate to `http://localhost:3000/connect` and click **"Autorizar con Strava"**.

---

## OAuth Flow

```
User → /connect
         ↓ clicks "Autorizar"
GET /api/auth/strava
         ↓ redirect to Strava
https://strava.com/oauth/authorize?client_id=...
         ↓ user grants access
GET /api/auth/strava/callback?code=abc123
         ↓ POST to Strava token endpoint
         ↓ save tokens to httpOnly cookies
GET /dashboard?connected=true
```

---

## API Routes

### `GET /api/strava/activities`

Fetches activities and returns computed PMC data.

**Response:**
```json
{
  "activities": [...],
  "trainingDays": [...],
  "pmc": [...],
  "today": { "atl": 68.2, "ctl": 74.1, "tsb": 5.9 },
  "source": "strava",
  "meta": { "activitiesCount": 38, "daysWindow": 90, "fetchedAt": "..." }
}
```

**Query params:**
- `?days=90` — trailing day window (default: 90)
- `?raw=true` — include raw Strava response

**Auth:** Requires valid Strava session (cookie). Returns `401` if not connected.

### `POST /api/strava/disconnect`

Clears session cookies. Returns `{ "disconnected": true }`.

---

## TSS Calculation (`lib/metrics.ts`)

```typescript
calculateTSS(activity, thresholdPaceMinPerKm?, lthrBpm?)
```

| Input | Default | Description |
|-------|---------|-------------|
| `moving_time` | — | Activity duration in seconds |
| `average_pace` | — | Pace in min/km |
| `average_heartrate` | optional | bpm (preferred over pace) |
| `thresholdPaceMinPerKm` | `5.0` | Your threshold pace |
| `lthrBpm` | `165` | Lactate threshold HR |

**Formula:**
```
TSS = duration_hours × IF² × 100

IF (with HR)   = avg_heartrate / lthr
IF (with pace) = threshold_pace / actual_pace
```

For athlete-specific accuracy, store threshold values in the athlete profile and pass them as arguments.

---

## PMC Calculations (`lib/metrics.ts`)

### ATL — Acute Training Load (fatigue)
```
ATL_t = ATL_{t-1} × (6/7) + TSS_t × (1/7)
```

### CTL — Chronic Training Load (fitness)
```
CTL_t = CTL_{t-1} × (41/42) + TSS_t × (1/42)
```

### TSB — Training Stress Balance (form)
```
TSB = CTL − ATL
```

| TSB | State |
|-----|-------|
| > +10 | Very fresh |
| 0 → +10 | **Optimal race window** |
| −10 → 0 | Normal training |
| −30 → −10 | Heavy block |
| < −30 | Overtraining risk |

---

## Dashboard Data Flow

```
app/dashboard/page.tsx (Server Component)
  └── getDashboardMetrics()           lib/dashboardData.ts
        ├── getValidAccessToken()     lib/stravaSession.ts
        │     ├── Read cookies
        │     └── Auto-refresh if expired
        ├── fetchStravaActivitiesLast90Days()   lib/strava.ts
        ├── normalizeActivities()              lib/strava.ts
        ├── activitiesToTrainingDays()         lib/strava.ts
        └── buildMetricSeries()               lib/metrics.ts
              └── calculateATL() + calculateCTL() + calculateTSB()
```

If Strava is not connected or the fetch fails, `getDashboardMetrics()` silently falls back to the demo data in `lib/data.ts`.

---

## Production Checklist

- [ ] Set `STRAVA_REDIRECT_URI` to your production domain
- [ ] Update **Authorization Callback Domain** in Strava app settings
- [ ] Use a proper session store (Redis / DB) instead of cookies for multi-user apps
- [ ] Store athlete-specific `thresholdPace` and `lthr` values in your database
- [ ] Add `NEXTAUTH_SECRET` if you extend to full auth

---

*Running OS · v0.2.0 · Strava Integration*
