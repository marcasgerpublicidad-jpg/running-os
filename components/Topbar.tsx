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
  const syncProps = onSync
    ? { onClick: onSync }
    : { href: "/api/auth/strava" };

  return (
    <header className="relative flex min-h-[108px] flex-shrink-0 items-end justify-between border-b border-white/[0.06] px-10 pb-6 pt-7">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.05),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />
      <div className="relative flex flex-col gap-2">
        <span className="font-mono text-[9px] tracking-[0.28em] uppercase text-ros-mid">
          Athlete Command
        </span>
        <div className="flex items-end gap-5">
          <span className="font-sans text-[42px] font-semibold tracking-[-0.07em] text-ros-bright leading-none">
            {title}
          </span>
          <span className="pb-1.5 font-mono text-[10px] text-ros-mid tracking-[0.08em] uppercase">
            {date}
          </span>
        </div>
      </div>

      <div className="relative flex items-center gap-3">
        <div className="flex items-center gap-2.5 border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-4 py-2.5 shadow-[0_16px_30px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className={`w-2 h-2 rounded-full ${s.dot} ${s.shadow}`} />
          <span className="font-mono text-[8px] tracking-[0.24em] uppercase text-ros-mid">
            Readiness
          </span>
          <span className={`font-mono text-[10px] font-semibold tracking-[0.14em] uppercase ${s.label}`}>
            {readinessLabel}
          </span>
        </div>

        <a
          {...syncProps}
          className="ros-button"
        >
          Sync Strava
        </a>
      </div>
    </header>
  );
}
