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
}

interface TooltipProps {
  active?:  boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?:   string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-ros-surface border border-ros-border2 px-3 py-2.5">
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

export default function PMCChart({ data, days = 42 }: PMCChartProps) {
  // Slice to requested window and format date labels
  const chartData = data.slice(-days).map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("es-AR", { day: "2-digit", month: "short" }),
  }));

  // Show only ~6 evenly spaced x-axis labels
  const tickInterval = Math.floor(chartData.length / 6);

  return (
    <div className="bg-ros-card border border-ros-border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <span className="font-mono text-[10px] font-semibold tracking-[0.2em] uppercase text-ros-muted">
          Performance Management Chart · {days} días
        </span>
        <span className="font-mono text-[9px] text-ros-faint tracking-[0.12em] uppercase
                         border-b border-ros-faint pb-px cursor-pointer hover:text-ros-muted
                         hover:border-ros-muted transition-colors">
          Ver completo →
        </span>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
          <CartesianGrid
            strokeDasharray="0"
            stroke="#1C1C1C"
            vertical={false}
          />

          {/* Zero line for TSB reference */}
          <ReferenceLine y={0} stroke="#2A2A2A" strokeDasharray="4 4" />

          <XAxis
            dataKey="label"
            tick={{ fontFamily: "IBM Plex Mono", fontSize: 8, fill: "#383838", letterSpacing: 1 }}
            axisLine={false}
            tickLine={false}
            interval={tickInterval}
          />
          <YAxis
            tick={{ fontFamily: "IBM Plex Mono", fontSize: 8, fill: "#383838" }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* CTL — fitness (slow, blue) */}
          <Line
            type="monotone"
            dataKey="ctl"
            name="CTL"
            stroke="#60A5FA"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, fill: "#60A5FA" }}
          />

          {/* ATL — fatigue (fast, red) */}
          <Line
            type="monotone"
            dataKey="atl"
            name="ATL"
            stroke="#F87171"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, fill: "#F87171" }}
          />

          {/* TSB — form (dashed, green) */}
          <Line
            type="monotone"
            dataKey="tsb"
            name="TSB"
            stroke="#4ADE80"
            strokeWidth={1}
            strokeDasharray="4 3"
            dot={false}
            activeDot={{ r: 3, fill: "#4ADE80" }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex gap-5 mt-3.5">
        {[
          { color: "#60A5FA", label: "CTL Forma crónica"  },
          { color: "#F87171", label: "ATL Fatiga aguda"   },
          { color: "#4ADE80", label: "TSB Balance"        },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
            <span className="font-mono text-[9px] text-ros-mid tracking-[0.1em] uppercase">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
