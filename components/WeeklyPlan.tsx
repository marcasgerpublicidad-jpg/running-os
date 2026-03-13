"use client";

import type { DayPlan } from "@/lib/data";

interface WeeklyPlanProps {
  days: DayPlan[];
}

export default function WeeklyPlan({ days }: WeeklyPlanProps) {
  return (
    <div className="bg-ros-card border border-ros-border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <span className="font-mono text-[10px] font-semibold tracking-[0.2em] uppercase text-ros-muted">
          Semana · Plan
        </span>
        <span className="font-mono text-[9px] text-ros-faint tracking-[0.12em] uppercase
                         border-b border-ros-faint pb-px cursor-pointer hover:text-ros-muted
                         hover:border-ros-muted transition-colors">
          Editar →
        </span>
      </div>

      {/* Day columns */}
      <div className="flex gap-1">
        {days.map((day) => (
          <div key={day.day} className="flex-1 flex flex-col items-center gap-1.5">
            {/* Day name */}
            <span className="font-mono text-[9px] text-ros-mid tracking-[0.1em] uppercase">
              {day.day}
            </span>

            {/* Bar */}
            <div
              className={`w-full h-14 bg-ros-faint rounded-sm relative overflow-hidden flex items-end
                          ${day.isToday ? "ring-1 ring-ros-bright" : ""}`}
            >
              <div
                className="w-full rounded-t-sm transition-all duration-1000"
                style={{
                  height:   `${day.pct * 100}%`,
                  background: day.color,
                  opacity:    day.isToday ? 1 : 0.55,
                }}
              />
              {/* Today indicator */}
              {day.isToday && (
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-ros-bright" />
              )}
            </div>

            {/* Session type */}
            <span className="font-mono text-[8px] text-ros-mid tracking-[0.05em] text-center leading-[1.3]">
              {day.type}
            </span>

            {/* TSS */}
            {day.tss > 0 && (
              <span className="font-mono text-[8px] text-ros-faint">
                {day.tss}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
