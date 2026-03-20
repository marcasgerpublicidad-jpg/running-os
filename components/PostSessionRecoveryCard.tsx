"use client";

import type { PostSessionRecovery } from "@/lib/postWorkoutRecovery";

interface PostSessionRecoveryCardProps {
  recovery: PostSessionRecovery;
}

const URGENCY_STYLES: Record<PostSessionRecovery["urgency"], string> = {
  low: "text-ros-mid border-white/[0.08] bg-white/[0.03]",
  medium: "text-ros-amber border-ros-amber/20 bg-ros-amber/10",
  high: "text-ros-green border-ros-green/20 bg-ros-green/10",
};

const URGENCY_LABELS: Record<PostSessionRecovery["urgency"], string> = {
  low: "Opcional",
  medium: "Recomendado",
  high: "Prioritario",
};

export default function PostSessionRecoveryCard({ recovery }: PostSessionRecoveryCardProps) {
  if (!recovery.suggested) {
    return (
      <div className="ros-panel p-7">
        <div className="flex items-center justify-between">
          <span className="ros-module-title">Post-Session Recovery</span>
          <span className="font-mono text-[8px] text-ros-faint tracking-[0.22em] uppercase">Sin bloque</span>
        </div>
        <div className="mt-4 font-sans text-sm text-ros-muted leading-6">
          Hoy no hace falta una descarga post-entreno específica. Alcanzan hábitos básicos de recuperación y volver a la calma.
        </div>
      </div>
    );
  }

  return (
    <div className="ros-panel p-7">
      <div className="flex items-center justify-between">
        <span className="ros-module-title">Post-Session Recovery</span>
        <span className={`ros-status-badge ${URGENCY_STYLES[recovery.urgency]}`}>
          {URGENCY_LABELS[recovery.urgency]}
        </span>
      </div>

      <div className="mt-4 grid gap-5 md:grid-cols-[120px_1fr]">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[8px] text-ros-faint tracking-[0.2em] uppercase">Duración</span>
          <span className="font-sans text-[34px] font-semibold text-ros-bright tracking-[-0.05em]">
            {recovery.durationMin}
            <span className="ml-1 text-[13px] font-medium text-ros-mid tracking-[0.08em] uppercase">min</span>
          </span>
        </div>

        <div className="grid gap-3">
          <div>
            <div className="font-mono text-[8px] text-ros-faint tracking-[0.2em] uppercase mb-1">Foco muscular</div>
            <div className="font-sans text-sm text-ros-text leading-6">{recovery.focusAreas}</div>
          </div>
          <div>
            <div className="font-mono text-[8px] text-ros-faint tracking-[0.2em] uppercase mb-1">Por qué hoy</div>
            <div className="font-sans text-sm text-ros-muted leading-6">{recovery.reason}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
