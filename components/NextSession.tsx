"use client";

import type { NextSession as NextSessionData } from "@/lib/data";

interface NextSessionProps {
  session: NextSessionData;
  title?: string;
  note?: string;
}

interface ParamRowProps {
  label: string;
  value: string | number;
}

function ParamRow({ label, value }: ParamRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-ros-border last:border-b-0">
      <span className="font-mono text-[9px] text-ros-mid tracking-[0.16em] uppercase">
        {label}
      </span>
      <span className="font-mono text-[12px] font-semibold text-ros-text tracking-[0.04em]">
        {value}
      </span>
    </div>
  );
}

export default function NextSession({ session, title, note }: NextSessionProps) {
  return (
    <div className="ros-hero-panel flex flex-col">
      <div className="flex items-center justify-between">
        <span className="ros-module-title">
          {title ?? "Próxima sesión"}
        </span>
        <span className="font-mono text-[8px] text-ros-faint tracking-[0.22em] uppercase">
          Operativa del día
        </span>
      </div>

      {note ? (
        <div className="relative mt-3 max-w-[34ch] font-sans text-sm text-ros-muted leading-6">
          {note}
        </div>
      ) : null}

      <div className="relative font-sans text-[38px] font-semibold text-ros-bright leading-[0.95] tracking-[-0.07em] mt-5 mb-7">
        {session.type.split(" ").map((word, i) => (
          <span key={i}>
            {word}
            {i < session.type.split(" ").length - 1 && <br />}
          </span>
        ))}
      </div>

      <div className="relative flex-1 border-y border-white/[0.06] py-2">
        <ParamRow label="Duración"      value={session.duration} />
        <ParamRow label="Distancia est." value={session.distance} />
        <ParamRow label="Zona FC"        value={session.hrZone} />
        <ParamRow label="Ritmo objetivo" value={session.targetPace} />
        <ParamRow label="TSS estimado"   value={`~${session.estimatedTSS}`} />
      </div>

      <button
        className="ros-button mt-5 w-full"
      >
        Iniciar sesión
      </button>
    </div>
  );
}
