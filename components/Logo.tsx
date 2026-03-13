"use client";

/** Animated waveform logo mark. */
export default function Logo() {
  const bars = [
    { h: "h-[7px]",  anim: "animate-wave-1" },
    { h: "h-[13px]", anim: "animate-wave-2" },
    { h: "h-[20px]", anim: "animate-wave-3" },
    { h: "h-[26px]", anim: "animate-wave-4" },
    { h: "h-[20px]", anim: "animate-wave-5" },
    { h: "h-[13px]", anim: "animate-wave-6" },
    { h: "h-[7px]",  anim: "animate-wave-7" },
  ];

  return (
    <div className="flex items-center gap-2.5">
      {/* Waveform mark */}
      <div className="flex items-center gap-[3px]">
        {bars.map((b, i) => (
          <div
            key={i}
            className={`w-[2.5px] ${b.h} bg-ros-bright rounded-sm ${b.anim}`}
          />
        ))}
      </div>

      {/* Wordmark */}
      <div className="flex flex-col gap-px">
        <span className="font-mono text-[13px] font-bold text-ros-bright tracking-[0.06em] leading-none">
          RUNNING OS
        </span>
        <span className="font-mono text-[8px] font-light text-ros-mid tracking-[0.18em] leading-none uppercase">
          Athlete System
        </span>
      </div>
    </div>
  );
}
