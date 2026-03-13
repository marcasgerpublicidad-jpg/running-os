"use client";

import type { NextSession as NextSessionData } from "@/lib/data";

interface NextSessionProps {
  session: NextSessionData;
}

interface ParamRowProps {
  label: string;
  value: string | number;
}

function ParamRow({ label, value }: ParamRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-ros-border last:border-b-0">
      <span className="font-mono text-[9px] text-ros-mid tracking-[0.16em] uppercase">
        {label}
      </span>
      <span className="font-mono text-[12px] font-semibold text-ros-text tracking-[0.04em]">
        {value}
      </span>
    </div>
  );
}

export default function NextSession({ session }: NextSessionProps) {
  return (
    <div className="bg-ros-card border border-ros-border p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-semibold tracking-[0.2em] uppercase text-ros-muted">
          Próxima sesión
        </span>
      </div>

      {/* Session type — large */}
      <div className="font-mono text-[28px] font-bold text-ros-bright leading-tight tracking-[-0.01em] mt-2 mb-4">
        {session.type.split(" ").map((word, i) => (
          <span key={i}>
            {word}
            {i < session.type.split(" ").length - 1 && <br />}
          </span>
        ))}
      </div>

      {/* Parameters */}
      <div className="flex-1">
        <ParamRow label="Duración"      value={session.duration} />
        <ParamRow label="Distancia est." value={session.distance} />
        <ParamRow label="Zona FC"        value={session.hrZone} />
        <ParamRow label="Ritmo objetivo" value={session.targetPace} />
        <ParamRow label="TSS estimado"   value={`~${session.estimatedTSS}`} />
      </div>

      {/* CTA */}
      <button
        className="mt-4 w-full bg-ros-bright text-ros-bg font-mono text-[10px] font-bold
                   tracking-[0.18em] uppercase py-2.5 text-center
                   hover:opacity-85 transition-opacity duration-200 cursor-pointer border-none"
      >
        Iniciar sesión →
      </button>
    </div>
  );
}
