"use client";

import type { Alert, AlertLevel } from "@/lib/data";

interface AlertsPanelProps {
  alerts: Alert[];
}

const PIP_COLOR: Record<AlertLevel, string> = {
  green: "bg-ros-green",
  amber: "bg-ros-amber",
  red:   "bg-ros-red",
  blue:  "bg-ros-blue",
};

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <div className="ros-panel p-7">
      <div className="flex items-center justify-between mb-1">
        <span className="ros-module-title">
          Sistema · Alertas
        </span>
        <span className="font-mono text-[8px] text-ros-faint tracking-[0.22em] uppercase">
          Operational Feed
        </span>
      </div>

      <div className="mt-4 flex flex-col">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start gap-3 py-3 border-b border-white/[0.06] last:border-b-0"
          >
            <div
              className={`w-[6px] h-[6px] rounded-full mt-2 flex-shrink-0 ${PIP_COLOR[alert.level]}`}
            />

            <div className="flex-1 min-w-0">
              <p className="font-sans text-[13px] text-ros-muted leading-6">
                <span className="text-ros-bright font-semibold tracking-[-0.02em]">{alert.title} </span>
                {alert.body}
              </p>
              <p className="font-mono text-[8px] text-ros-faint tracking-[0.18em] uppercase mt-1.5">
                {alert.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
