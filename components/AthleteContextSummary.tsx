import {
  EXECUTION_PREFERENCE_LABELS,
  LONG_RUN_DAY_LABELS,
  QUALITY_STYLE_LABELS,
  INTENSITY_MODEL_LABELS,
  TOLERANCE_LABELS,
  formatGoalLabel,
  formatAvailabilityDays,
  formatSessionStyles,
  formatSurfaces,
  type AthleteContext,
} from "@/lib/athleteContextShared";
import type { PlanningHorizon } from "@/lib/planningHorizon";

interface AthleteContextSummaryProps {
  profile: AthleteContext;
  horizon?: PlanningHorizon;
  compact?: boolean;
}

export default function AthleteContextSummary({ profile, horizon, compact = false }: AthleteContextSummaryProps) {
  return (
    <div className="ros-panel p-7">
      <div className="flex items-center justify-between">
        <span className="ros-module-title">Contexto del atleta</span>
        <a href="/profile" className="ros-button">
          Editar
        </a>
      </div>

      {profile.isConfigured ? (
        compact ? (
          <div className="mt-4 flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="font-mono text-[8px] text-ros-faint tracking-[0.2em] uppercase mb-1">Objetivo principal</div>
                <div className="font-sans text-sm text-ros-text">
                  {profile.primaryGoalLabel || profile.primaryGoalDate
                    ? `${formatGoalLabel(profile.primaryGoalType, profile.primaryGoalLabel)}${profile.primaryGoalDate ? ` · ${profile.primaryGoalDate}` : ""}`
                    : "Sin objetivo principal"}
                </div>
              </div>
              <div>
                <div className="font-mono text-[8px] text-ros-faint tracking-[0.2em] uppercase mb-1">Horizonte actual</div>
                <div className="font-sans text-sm text-ros-text">{horizon?.phaseLabel ?? "Sin horizonte cargado"}</div>
              </div>
              <div>
                <div className="font-mono text-[8px] text-ros-faint tracking-[0.2em] uppercase mb-1">Disponibilidad</div>
                <div className="font-sans text-sm text-ros-text">{formatAvailabilityDays(profile.availabilityDays)}</div>
              </div>
              <div>
                <div className="font-mono text-[8px] text-ros-faint tracking-[0.2em] uppercase mb-1">Intensidad</div>
                <div className="font-sans text-sm text-ros-text">{INTENSITY_MODEL_LABELS[profile.preferredIntensityModel]}</div>
              </div>
              <div>
                <div className="font-mono text-[8px] text-ros-faint tracking-[0.2em] uppercase mb-1">Estilo</div>
                <div className="font-sans text-sm text-ros-text">{formatSessionStyles(profile.preferredSessionStyles)}</div>
              </div>
              <div>
                <div className="font-mono text-[8px] text-ros-faint tracking-[0.2em] uppercase mb-1">Tolerancia</div>
                <div className="font-sans text-sm text-ros-text">{TOLERANCE_LABELS[profile.toleranceProfile]}</div>
              </div>
            </div>

            {(profile.notes || profile.goalNotes || profile.constraintNotes) ? (
              <div className="ros-panel-muted px-4 py-3">
                <div className="font-mono text-[8px] text-ros-faint tracking-[0.2em] uppercase mb-1">Nota útil</div>
                <div className="font-sans text-sm leading-6 text-ros-text">
                  {profile.constraintNotes || profile.goalNotes || profile.notes}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {horizon ? (
            <div className="md:col-span-2 ros-panel-muted px-4 py-4">
              <div className="font-mono text-[8px] text-ros-faint tracking-[0.2em] uppercase mb-1">Horizonte actual</div>
              <div className="font-sans text-sm text-ros-text">{horizon.summary}</div>
            </div>
          ) : null}
          <div>
            <div className="font-mono text-[8px] text-ros-faint tracking-[0.2em] uppercase mb-1">Disponibilidad</div>
            <div className="font-sans text-sm text-ros-text">{formatAvailabilityDays(profile.availabilityDays)}</div>
          </div>
          <div>
            <div className="font-mono text-[8px] text-ros-faint tracking-[0.2em] uppercase mb-1">Intensidad</div>
            <div className="font-sans text-sm text-ros-text">{INTENSITY_MODEL_LABELS[profile.preferredIntensityModel]}</div>
          </div>
          <div>
            <div className="font-mono text-[8px] text-ros-faint tracking-[0.2em] uppercase mb-1">Estilo</div>
            <div className="font-sans text-sm text-ros-text">{formatSessionStyles(profile.preferredSessionStyles)}</div>
          </div>
          <div>
            <div className="font-mono text-[8px] text-ros-faint tracking-[0.2em] uppercase mb-1">Superficies</div>
            <div className="font-sans text-sm text-ros-text">{formatSurfaces(profile.surfaceContext)}</div>
          </div>
          <div>
            <div className="font-mono text-[8px] text-ros-faint tracking-[0.2em] uppercase mb-1">Tolerancia</div>
            <div className="font-sans text-sm text-ros-text">{TOLERANCE_LABELS[profile.toleranceProfile]}</div>
          </div>
          <div>
            <div className="font-mono text-[8px] text-ros-faint tracking-[0.2em] uppercase mb-1">Restricciones</div>
            <div className="font-sans text-sm text-ros-text">{profile.scheduleConstraints || "Sin restricciones declaradas"}</div>
          </div>
          <div>
            <div className="font-mono text-[8px] text-ros-faint tracking-[0.2em] uppercase mb-1">Objetivo principal</div>
            <div className="font-sans text-sm text-ros-text">
              {profile.primaryGoalLabel || profile.primaryGoalDate
                ? `${formatGoalLabel(profile.primaryGoalType, profile.primaryGoalLabel)}${profile.primaryGoalDate ? ` · ${profile.primaryGoalDate}` : ""}`
                : "Sin objetivo principal"}
            </div>
          </div>
          <div>
            <div className="font-mono text-[8px] text-ros-faint tracking-[0.2em] uppercase mb-1">Objetivo secundario</div>
            <div className="font-sans text-sm text-ros-text">
              {profile.secondaryGoalLabel || profile.secondaryGoalDate
                ? `${formatGoalLabel(profile.secondaryGoalType, profile.secondaryGoalLabel)}${profile.secondaryGoalDate ? ` · ${profile.secondaryGoalDate}` : ""}`
                : "Sin objetivo secundario"}
            </div>
          </div>
          <div>
            <div className="font-mono text-[8px] text-ros-faint tracking-[0.2em] uppercase mb-1">Calidad preferida</div>
            <div className="font-sans text-sm text-ros-text">{QUALITY_STYLE_LABELS[profile.preferredQualityStyle]}</div>
          </div>
          <div>
            <div className="font-mono text-[8px] text-ros-faint tracking-[0.2em] uppercase mb-1">Preferencia de ejecución</div>
            <div className="font-sans text-sm text-ros-text">{EXECUTION_PREFERENCE_LABELS[profile.executionPreference]}</div>
          </div>
          <div>
            <div className="font-mono text-[8px] text-ros-faint tracking-[0.2em] uppercase mb-1">Fondo estructural</div>
            <div className="font-sans text-sm text-ros-text">
              {profile.monthlyLongRunRule ? "42K mensual activo" : "Sin regla mensual"}
              {` · ${LONG_RUN_DAY_LABELS[profile.longRunDayPreference]}`}
            </div>
          </div>
          <div>
            <div className="font-mono text-[8px] text-ros-faint tracking-[0.2em] uppercase mb-1">Intervalos clásicos</div>
            <div className="font-sans text-sm text-ros-text">{profile.avoidClassicIntervals ? "Evitar" : "Permitidos si suman"}</div>
          </div>
          <div className="md:col-span-2">
            <div className="font-mono text-[8px] text-ros-faint tracking-[0.2em] uppercase mb-1">Notas del atleta</div>
            <div className="font-sans text-sm text-ros-text">{profile.notes || "Sin notas adicionales."}</div>
          </div>
          <div className="md:col-span-2">
            <div className="font-mono text-[8px] text-ros-faint tracking-[0.2em] uppercase mb-1">Reglas personales</div>
            <div className="font-sans text-sm text-ros-text">{profile.constraintNotes || profile.goalNotes || "Sin reglas adicionales cargadas."}</div>
          </div>
        </div>
        )
      ) : (
        <div className="mt-4 font-sans text-sm text-ros-muted leading-6">
          Todavía no configuraste tu perfil del atleta. Cuando lo hagas, Running OS va a poder leer tu disponibilidad, tus objetivos y tus reglas personales con mucha más precisión.
        </div>
      )}
    </div>
  );
}
