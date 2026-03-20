"use client";

type Accent = "red" | "blue" | "green" | "amber";

interface MetricCardProps {
  label:       string;       // e.g. "ATL · Fatiga aguda"
  value:       number | string;
  unit:        string;
  delta:       string;       // e.g. "↑ +4 esta semana"
  deltaColor:  Accent;
  description: string;
  accent:      Accent;
  dimmed?:     boolean;
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
  dimmed = false,
}: MetricCardProps) {
  return (
    <div className="ros-panel relative overflow-hidden px-6 py-6 transition-all duration-300 hover:-translate-y-[1px] hover:border-white/[0.1]">
      <div className={`absolute inset-x-0 top-0 h-px ${ACCENT_TOP[accent]}`} />
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/[0.03] blur-3xl" />
      <div className="font-mono text-[9px] font-medium tracking-[0.24em] uppercase text-ros-mid mb-5">
        {label}
      </div>

      <div className="font-sans text-[50px] font-semibold text-ros-bright leading-none tracking-[-0.07em]">
        {value}
        {unit ? <span className="text-[13px] font-medium text-ros-mid ml-1 tracking-[0.08em] uppercase">{unit}</span> : null}
      </div>

      <div className={`font-mono text-[10px] mt-4 tracking-[0.16em] uppercase ${dimmed ? "text-ros-mid" : DELTA_COLOR[deltaColor]}`}>
        {delta}
      </div>

      <div className="font-sans text-[12px] text-ros-muted mt-4 leading-6 max-w-[26ch]">
        {description}
      </div>
    </div>
  );
}
