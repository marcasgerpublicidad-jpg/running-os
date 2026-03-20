"use client";

import type { PreSessionActivation } from "@/lib/sessionPreparation";

interface PreSessionActivationCardProps {
  activation: PreSessionActivation;
  compact?: boolean;
}

function blockTypeLabel(blockType: PreSessionActivation["blockType"]): string {
  switch (blockType) {
    case "mobility-light":
      return "Movilidad ligera";
    case "dynamic-primer":
      return "Primer dinámico";
    case "neuromuscular-primer":
      return "Primer neuromuscular";
    case "stability-primer":
      return "Estabilidad";
    case "long-run-primer":
      return "Primer de largo";
    default:
      return "Sin activación";
  }
}

export default function PreSessionActivationCard({ activation, compact = false }: PreSessionActivationCardProps) {
  if (!activation.recommended) {
    return (
      <div className="ros-panel p-7">
        <div className="flex items-center justify-between">
          <span className="ros-module-title">Pre-Session Activation</span>
          <span className="font-mono text-[8px] text-ros-faint tracking-[0.22em] uppercase">No requerida</span>
        </div>
        <div className="mt-4 font-sans text-sm text-ros-muted leading-6">
          Hoy no hace falta una activación previa específica. El foco está en ejecutar la sesión sin sumar ruido antes de empezar.
        </div>
      </div>
    );
  }

  return (
    <div className="ros-panel p-7">
      <div className="flex items-center justify-between">
        <span className="ros-module-title">Pre-Session Activation</span>
        <span className="ros-status-badge border-white/[0.08] bg-white/[0.03] text-ros-bright">
          {blockTypeLabel(activation.blockType)}
        </span>
      </div>

      <div className={`mt-4 ${compact ? "grid gap-4" : "grid gap-5 md:grid-cols-[120px_1fr]"}`}>
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[8px] text-ros-faint tracking-[0.2em] uppercase">Duración</span>
          <span className="font-sans text-[34px] font-semibold text-ros-bright tracking-[-0.05em]">
            {activation.durationMin}
            <span className="ml-1 text-[13px] font-medium text-ros-mid tracking-[0.08em] uppercase">min</span>
          </span>
        </div>

        <div className="grid gap-3">
          <div>
            <div className="font-mono text-[8px] text-ros-faint tracking-[0.2em] uppercase mb-1">Foco</div>
            <div className="font-sans text-sm text-ros-text leading-6">{activation.focus}</div>
          </div>
          <div>
            <div className="font-mono text-[8px] text-ros-faint tracking-[0.2em] uppercase mb-1">Objetivo</div>
            <div className="font-sans text-sm text-ros-muted leading-6">{activation.objective}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
