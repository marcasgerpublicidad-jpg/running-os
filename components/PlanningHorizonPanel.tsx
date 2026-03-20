import type { PlanningHorizon } from "@/lib/planningHorizon";

interface PlanningHorizonPanelProps {
  horizon: PlanningHorizon;
  compact?: boolean;
}

export default function PlanningHorizonPanel({ horizon, compact = false }: PlanningHorizonPanelProps) {
  if (!horizon.hasGoals) {
    return (
      <div className="ros-panel-muted px-5 py-4">
        <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-ros-mid">Horizonte de planificación</div>
        <div className="mt-2 font-sans text-sm leading-6 text-ros-muted">
          Todavía no cargaste un objetivo principal o secundario. Sumarlos en Perfil ayuda a que el sistema deje de sonar genérico.
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="ros-panel-muted px-5 py-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-ros-mid">Horizonte de planificación</div>
            <div className="mt-2 font-sans text-sm leading-6 text-ros-text">{horizon.summary}</div>
          </div>
          <div className="grid grid-cols-3 gap-3 md:min-w-[360px]">
            <div className="rounded-[4px] border border-white/[0.06] bg-white/[0.025] px-3 py-2.5">
              <div className="font-mono text-[8px] tracking-[0.18em] uppercase text-ros-faint">Objetivo</div>
              <div className="mt-1.5 font-sans text-[13px] font-semibold tracking-[-0.03em] text-ros-bright">
                {horizon.dominantGoal?.displayLabel ?? "Sin foco"}
              </div>
            </div>
            <div className="rounded-[4px] border border-white/[0.06] bg-white/[0.025] px-3 py-2.5">
              <div className="font-mono text-[8px] tracking-[0.18em] uppercase text-ros-faint">Semanas</div>
              <div className="mt-1.5 font-sans text-[13px] font-semibold tracking-[-0.03em] text-ros-bright">
                {horizon.dominantGoal?.weeksUntil !== null ? `${horizon.dominantGoal?.weeksUntil}` : "—"}
              </div>
            </div>
            <div className="rounded-[4px] border border-white/[0.06] bg-white/[0.025] px-3 py-2.5">
              <div className="font-mono text-[8px] tracking-[0.18em] uppercase text-ros-faint">Ventana</div>
              <div className="mt-1.5 font-sans text-[13px] font-semibold tracking-[-0.03em] text-ros-bright">
                {horizon.phaseLabel}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ros-panel-muted px-5 py-4">
      <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-ros-mid">Horizonte de planificación</div>
      <div className="mt-2 font-sans text-sm leading-6 text-ros-text">{horizon.summary}</div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-[4px] border border-white/[0.06] bg-white/[0.025] px-4 py-3">
          <div className="font-mono text-[8px] tracking-[0.18em] uppercase text-ros-faint">Objetivo dominante</div>
          <div className="mt-2 font-sans text-[15px] font-semibold tracking-[-0.04em] text-ros-bright">
            {horizon.dominantGoal?.displayLabel ?? "Sin foco"}
          </div>
        </div>
        <div className="rounded-[4px] border border-white/[0.06] bg-white/[0.025] px-4 py-3">
          <div className="font-mono text-[8px] tracking-[0.18em] uppercase text-ros-faint">Semanas restantes</div>
          <div className="mt-2 font-sans text-[15px] font-semibold tracking-[-0.04em] text-ros-bright">
            {horizon.dominantGoal?.weeksUntil !== null ? `${horizon.dominantGoal?.weeksUntil}` : "—"}
          </div>
        </div>
        <div className="rounded-[4px] border border-white/[0.06] bg-white/[0.025] px-4 py-3">
          <div className="font-mono text-[8px] tracking-[0.18em] uppercase text-ros-faint">Ventana actual</div>
          <div className="mt-2 font-sans text-[15px] font-semibold tracking-[-0.04em] text-ros-bright">
            {horizon.phaseLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
