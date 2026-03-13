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
    <div className="bg-ros-card border border-ros-border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[10px] font-semibold tracking-[0.2em] uppercase text-ros-muted">
          Sistema · Alertas
        </span>
      </div>

      {/* Alert list */}
      <div className="flex flex-col">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start gap-2.5 py-2.5 border-b border-ros-border last:border-b-0"
          >
            {/* Level pip */}
            <div
              className={`w-[5px] h-[5px] rounded-full mt-1 flex-shrink-0 ${PIP_COLOR[alert.level]}`}
            />

            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] text-ros-muted tracking-[0.04em] leading-[1.6]">
                <span className="text-ros-text font-semibold">{alert.title} </span>
                {alert.body}
              </p>
              <p className="font-mono text-[9px] text-ros-faint tracking-[0.08em] mt-0.5">
                {alert.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
