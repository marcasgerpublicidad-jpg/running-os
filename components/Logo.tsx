"use client";

export default function Logo() {
  return (
    <div className="flex items-center gap-5">
      <div className="relative flex h-[54px] w-[54px] items-center justify-center overflow-hidden rounded-[4px] border border-white/[0.10] bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] shadow-[0_18px_36px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.07)]">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="h-full w-full object-cover opacity-95 mix-blend-screen"
        >
          <source src="/brand/running-os-logo.mp4" type="video/mp4" />
        </video>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.10] via-transparent to-black/30" />
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex items-baseline gap-2.5">
          <span className="font-sans text-[17px] font-semibold text-ros-bright tracking-[0.22em] leading-none uppercase">
            Running
          </span>
          <span className="font-sans text-[17px] font-semibold text-ros-bright tracking-[0.16em] leading-none uppercase">
            OS
          </span>
        </div>
        <span className="font-mono text-[8px] font-light text-ros-mid tracking-[0.26em] leading-none uppercase">
          Athlete Operating System
        </span>
      </div>
    </div>
  );
}
