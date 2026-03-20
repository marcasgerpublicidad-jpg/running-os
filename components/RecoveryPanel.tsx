"use client";

import type { RecoveryData } from "@/lib/data";

interface RecoveryPanelProps {
  data: RecoveryData;
}

interface StatRowProps {
  label:   string;
  value:   string;
  pct:     number;
  barColor: string;
}

function StatRow({ label, value, pct, barColor }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-t border-ros-border">
      <span className="font-mono text-[9px] text-ros-mid tracking-[0.14em] uppercase">
        {label}
      </span>
      <div className="w-15 h-[3px] bg-ros-faint rounded-full overflow-hidden mx-3 flex-1 max-w-[60px]">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct * 100}%`, background: barColor }}
        />
      </div>
      <span className="font-mono text-[13px] font-semibold text-ros-bright tracking-[0.04em]">
        {value}
      </span>
    </div>
  );
}

export default function RecoveryPanel({ data }: RecoveryPanelProps) {
  // SVG ring calculation
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (data.score / 100) * circumference;

  return (
    <div className="ros-panel p-7 flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <span className="ros-module-title">
          Recuperación
        </span>
        <span className="font-mono text-[8px] text-ros-faint tracking-[0.24em] uppercase">
          Biomarkers
        </span>
      </div>

      <div className="flex flex-col items-center py-6">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke="#20262d"
            strokeWidth="8"
          />
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke="#88b89a"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dashoffset 1.5s ease" }}
          />
          {/* Score */}
          <text
            x="60" y="56"
            textAnchor="middle"
            fill="#f5f7fa"
            fontFamily="Manrope"
            fontSize="24"
            fontWeight="700"
          >
            {data.score}
          </text>
          <text
            x="60" y="72"
            textAnchor="middle"
            fill="#67707d"
            fontFamily="IBM Plex Mono"
            fontSize="8"
            letterSpacing="2"
          >
            / 100
          </text>
        </svg>
      </div>

      <div className="flex flex-col">
        <StatRow
          label="Sueño"
          value={`${Math.floor(data.sleep)}h ${Math.round((data.sleep % 1) * 60)}m`}
          pct={data.sleepPct}
          barColor="#60A5FA"
        />
        <StatRow
          label="HRV"
          value={`${data.hrv} ms`}
          pct={data.hrvPct}
          barColor="#FBBF24"
        />
        <StatRow
          label="FC reposo"
          value={`${data.restingHR} bpm`}
          pct={data.restingHRPct}
          barColor="#4ADE80"
        />
        <StatRow
          label="Piernas"
          value={data.muscleStatus}
          pct={data.musclePct}
          barColor="#FBBF24"
        />
      </div>
    </div>
  );
}
