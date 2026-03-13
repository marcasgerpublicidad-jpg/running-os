"use client";

type Accent = "red" | "blue" | "green" | "amber";

interface MetricCardProps {
  label:       string;       // e.g. "ATL · Fatiga aguda"
  value:       number;
  unit:        string;
  delta:       string;       // e.g. "↑ +4 esta semana"
  deltaColor:  Accent;
  description: string;
  accent:      Accent;
}

const ACCENT_TOP: Record<Accent, string> = {
  red:   "bg-ros-red",
  blue:  "bg-ros-blue",
  green: "bg-ros-green",
  amber: "bg-ros-amber",
};

const DELTA_COLOR: Record<Accent, string> = {
  red:   "text-ros-red",
  blue:  "text-ros-blue",
  green: "text-ros-green",
  amber: "text-ros-amber",
};

export default function MetricCard({
  label,
  value,
  unit,
  delta,
  deltaColor,
  description,
  accent,
}: MetricCardProps) {
  return (
    <div className="relative bg-ros-card border border-ros-border px-[22px] py-5 overflow-hidden
                    hover:border-ros-border2 transition-colors duration-200">
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-px ${ACCENT_TOP[accent]}`} />

      {/* Label */}
      <div className="font-mono text-[9px] font-medium tracking-[0.24em] uppercase text-ros-mid mb-3">
        {label}
      </div>

      {/* Value */}
      <div className="font-mono text-[42px] font-bold text-ros-bright leading-none tracking-tight">
        {value}
        <span className="text-[13px] font-light text-ros-mid ml-0.5">{unit}</span>
      </div>

      {/* Delta */}
      <div className={`font-mono text-[11px] mt-2 tracking-[0.04em] ${DELTA_COLOR[deltaColor]}`}>
        {delta}
      </div>

      {/* Description */}
      <div className="font-mono text-[9px] text-ros-mid tracking-[0.08em] mt-1 leading-[1.5]">
        {description}
      </div>
    </div>
  );
}
