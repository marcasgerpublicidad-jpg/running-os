"use client";

import type { DayPlan } from "@/lib/data";

interface WeeklyPlanProps {
  days: DayPlan[];
  variant?: "full" | "compact";
}

function getSessionTone(day: DayPlan): string {
  if (day.type === "Descanso") return "rgba(255,255,255,0.24)";
  if (day.type === "Recuperación") return "rgba(193,205,221,0.52)";
  if (day.type === "Largo") return "rgba(214,184,128,0.62)";
  return "rgba(184,192,204,0.58)";
}

export default function WeeklyPlan({ days, variant = "full" }: WeeklyPlanProps) {
  const isCompact = variant === "compact";

  return (
    <div className="ros-panel p-7">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <span className="ros-module-title">
            Semana · Plan
          </span>
          <span className="font-sans text-[13px] text-ros-muted">
            {isCompact
              ? "Lectura rápida de la estructura semanal."
              : "Estructura semanal con lectura protagonista del día actual."}
          </span>
        </div>
        <span className="ros-button">
          Editar
        </span>
      </div>

      <div className={`grid ${isCompact ? "gap-3 lg:grid-cols-7" : "gap-4 xl:grid-cols-7"}`}>
        {days.map((day) => (
          <div
            key={day.day}
            className={`relative overflow-hidden border transition-all duration-300 ${
              day.isToday
                ? "border-white/[0.14] bg-[linear-gradient(180deg,rgba(226,232,240,0.08),rgba(255,255,255,0.03))] shadow-[0_22px_36px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.05)]"
                : "border-white/[0.06] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.012))]"
            }`}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${getSessionTone(day)}, transparent)` }}
            />
            <div className={`flex h-full flex-col ${isCompact ? "gap-4 px-4 py-4" : "gap-5 px-4.5 py-5"}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="font-mono text-[8px] tracking-[0.2em] uppercase text-ros-faint">
                  {day.day}
                </div>
                {day.isToday ? (
                  <div className="ros-status-badge border-white/[0.08] bg-white/[0.05] px-2.5 py-1 text-ros-bright">
                    Hoy
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-3">
                <div className={`font-sans ${isCompact ? "text-[16px]" : "text-[20px]"} font-semibold tracking-[-0.04em] text-ros-bright leading-[1.06] break-words`}>
                  {day.type}
                </div>
                <div className="flex items-end justify-between">
                  <span className="font-mono text-[8px] tracking-[0.18em] uppercase text-ros-mid">
                    TSS
                  </span>
                  <span className={`font-sans ${isCompact ? "text-[18px]" : "text-[22px]"} font-semibold tracking-[-0.05em] text-ros-bright`}>
                    {day.tss}
                  </span>
                </div>
              </div>

              <div className="mt-auto space-y-3">
                <div className={`border border-white/[0.05] bg-ros-surface/75 ${isCompact ? "px-3 py-3" : "px-3 py-3.5"}`}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-mono text-[8px] tracking-[0.18em] uppercase text-ros-faint">
                      Carga relativa
                    </span>
                    <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-ros-mid">
                      {Math.round(day.pct * 100)}%
                    </span>
                  </div>
                  <div className="h-[6px] w-full overflow-hidden rounded-full bg-white/[0.04]">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.max(day.type === "Descanso" ? 10 : 12, day.pct * 100)}%`,
                        background: `linear-gradient(90deg, rgba(255,255,255,0.18), ${getSessionTone(day)})`,
                        boxShadow: `0 8px 18px ${getSessionTone(day).replace("0.62", "0.18").replace("0.58", "0.16").replace("0.52", "0.14").replace("0.24", "0.08")}`,
                      }}
                    />
                  </div>
                </div>

                {!isCompact ? (
                  <div className="grid gap-2">
                    <div className="font-mono text-[8px] tracking-[0.18em] uppercase text-ros-faint">
                      {day.type === "Descanso" ? "Sin estímulo" : "Estímulo del día"}
                    </div>
                    <div className="font-sans text-[12px] leading-5 text-ros-muted">
                      {day.type === "Descanso"
                        ? "Descarga total para sostener la estructura semanal."
                        : `Peso operativo medio/alto según ${Math.round(day.pct * 100)}% de la carga pico.`}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
