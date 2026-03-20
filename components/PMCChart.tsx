"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import type { DailyMetrics } from "@/lib/metrics";

interface PMCChartProps {
  data:  DailyMetrics[];
  /** How many trailing days to display. Default: 42 (full CTL window). */
  days?: number;
  emptyStateTitle?: string;
  emptyStateMessage?: string;
}

interface TooltipProps {
  active?:  boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?:   string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-ros-surface border border-ros-border2 px-3 py-2.5 shadow-[0_18px_36px_rgba(0,0,0,0.32)]">
      <div className="font-mono text-[9px] text-ros-mid tracking-[0.1em] uppercase mb-2">
        {label}
      </div>
      {payload.map((p) => (
        <div key={p.name} className="flex gap-3 items-center font-mono text-[10px] mb-0.5">
          <span style={{ color: p.color }} className="tracking-[0.08em]">{p.name}</span>
          <span className="text-ros-bright font-semibold ml-auto">{p.value.toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
}

export default function PMCChart({ data, days = 42, emptyStateTitle, emptyStateMessage }: PMCChartProps) {
  // Slice to requested window and format date labels
  const chartData = data.slice(-days).map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("es-AR", { day: "2-digit", month: "short" }),
  }));

  // Show only ~6 evenly spaced x-axis labels
  const tickInterval = Math.max(0, Math.floor(chartData.length / 6));

  return (
    <div className="ros-hero-panel">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <span className="ros-module-title">
            Performance Management Chart
          </span>
          <span className="font-sans text-[13px] text-ros-muted">
            ATL, CTL y TSB integrados en un panel técnico de {days} días.
          </span>
        </div>
        <span className="font-mono text-[9px] text-ros-faint tracking-[0.18em] uppercase border border-white/[0.08] px-3 py-1.5">
          Performance Management Chart · {days} días
        </span>
      </div>

      {chartData.length === 0 ? (
        <div className="ros-empty-state h-[240px] border border-dashed border-white/[0.08] bg-white/[0.02]">
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-ros-mid">
            {emptyStateTitle ?? "Sin datos PMC"}
          </div>
          <div className="font-sans text-sm text-ros-muted max-w-md">
            {emptyStateMessage ?? "No hay suficientes datos para construir el PMC."}
          </div>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
              <CartesianGrid
                strokeDasharray="2 8"
                stroke="#242a31"
                vertical={false}
              />
              <ReferenceLine y={0} stroke="#38404a" strokeDasharray="4 6" />

              <XAxis
                dataKey="label"
                tick={{ fontFamily: "IBM Plex Mono", fontSize: 8, fill: "#67707d", letterSpacing: 1.5 }}
                axisLine={false}
                tickLine={false}
                interval={tickInterval}
              />
              <YAxis
                tick={{ fontFamily: "IBM Plex Mono", fontSize: 8, fill: "#67707d" }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="ctl"
                name="CTL"
                stroke="#90a9c7"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: "#90a9c7" }}
              />
              <Line
                type="monotone"
                dataKey="atl"
                name="ATL"
                stroke="#b67d76"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: "#b67d76" }}
              />
              <Line
                type="monotone"
                dataKey="tsb"
                name="TSB"
                stroke="#88b89a"
                strokeWidth={1.4}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 3, fill: "#88b89a" }}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-5 flex gap-6">
            {[
              { color: "#90a9c7", label: "CTL Forma crónica"  },
              { color: "#b67d76", label: "ATL Fatiga aguda"   },
              { color: "#88b89a", label: "TSB Balance"        },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.color, boxShadow: `0 0 12px ${item.color}33` }} />
                <span className="font-mono text-[8px] text-ros-mid tracking-[0.16em] uppercase">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
