"use client";

type Signal = "green" | "amber" | "red";

interface TopbarProps {
  title:          string;
  date:           string;
  readinessSignal: Signal;
  readinessLabel:  string;
  onSync?:        () => void;
}

const SIGNAL_STYLES: Record<Signal, { dot: string; label: string; shadow: string }> = {
  green: {
    dot:    "bg-ros-green",
    label:  "text-ros-green",
    shadow: "shadow-[0_0_8px_rgba(74,222,128,0.6)]",
  },
  amber: {
    dot:    "bg-ros-amber",
    label:  "text-ros-amber",
    shadow: "shadow-[0_0_8px_rgba(251,191,36,0.6)]",
  },
  red: {
    dot:    "bg-ros-red",
    label:  "text-ros-red",
    shadow: "shadow-[0_0_8px_rgba(248,113,113,0.6)]",
  },
};

export default function Topbar({
  title,
  date,
  readinessSignal,
  readinessLabel,
  onSync,
}: TopbarProps) {
  const s = SIGNAL_STYLES[readinessSignal];

  return (
    <header className="h-14 flex-shrink-0 border-b border-ros-border flex items-center justify-between px-8">
      {/* Left */}
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[13px] font-semibold text-ros-bright tracking-[0.1em] uppercase">
          {title}
        </span>
        <span className="font-mono text-[11px] text-ros-mid tracking-[0.06em]">
          {date}
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">
        {/* Semáforo */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 border border-ros-border2 bg-ros-card">
          <div className={`w-2 h-2 rounded-full ${s.dot} ${s.shadow}`} />
          <span className={`font-mono text-[10px] font-semibold tracking-[0.14em] uppercase ${s.label}`}>
            {readinessLabel}
          </span>
        </div>

        {/* Sync */}
        <button
          onClick={onSync}
          className="font-mono text-[10px] text-ros-mid tracking-[0.1em] uppercase px-3.5 py-1.5
                     border border-ros-border2 bg-transparent hover:border-ros-muted hover:text-ros-text
                     transition-colors duration-200 cursor-pointer"
        >
          ↻ Sync Strava
        </button>
      </div>
    </header>
  );
}
