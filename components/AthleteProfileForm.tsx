"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DAY_LABELS,
  EXECUTION_PREFERENCE_LABELS,
  GOAL_TYPE_LABELS,
  INTENSITY_MODEL_LABELS,
  LONG_RUN_DAY_LABELS,
  QUALITY_STYLE_LABELS,
  SESSION_STYLE_LABELS,
  SURFACE_LABELS,
  TOLERANCE_LABELS,
  type AthleteContext,
  type AvailabilityDay,
  type ExecutionPreference,
  type GoalType,
  type LongRunDayPreference,
  type PreferredIntensityModel,
  type PreferredQualityStyle,
  type PreferredSessionStyle,
  type SurfaceType,
  type ToleranceProfile,
} from "@/lib/athleteContextShared";

interface AthleteProfileFormProps {
  initialProfile: AthleteContext;
}

const DAY_OPTIONS = Object.entries(DAY_LABELS) as Array<[AvailabilityDay, string]>;
const INTENSITY_OPTIONS = Object.entries(INTENSITY_MODEL_LABELS) as Array<[PreferredIntensityModel, string]>;
const STYLE_OPTIONS = Object.entries(SESSION_STYLE_LABELS) as Array<[PreferredSessionStyle, string]>;
const SURFACE_OPTIONS = Object.entries(SURFACE_LABELS) as Array<[SurfaceType, string]>;
const TOLERANCE_OPTIONS = Object.entries(TOLERANCE_LABELS) as Array<[ToleranceProfile, string]>;
const GOAL_TYPE_OPTIONS = Object.entries(GOAL_TYPE_LABELS) as Array<[GoalType, string]>;
const QUALITY_STYLE_OPTIONS = Object.entries(QUALITY_STYLE_LABELS) as Array<[PreferredQualityStyle, string]>;
const LONG_RUN_DAY_OPTIONS = Object.entries(LONG_RUN_DAY_LABELS) as Array<[LongRunDayPreference, string]>;
const EXECUTION_OPTIONS = Object.entries(EXECUTION_PREFERENCE_LABELS) as Array<[ExecutionPreference, string]>;

function toggleValue<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value];
}

export default function AthleteProfileForm({ initialProfile }: AthleteProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [availabilityDays, setAvailabilityDays] = useState<AvailabilityDay[]>(initialProfile.availabilityDays);
  const [preferredIntensityModel, setPreferredIntensityModel] = useState<PreferredIntensityModel>(initialProfile.preferredIntensityModel);
  const [preferredSessionStyles, setPreferredSessionStyles] = useState<PreferredSessionStyle[]>(initialProfile.preferredSessionStyles);
  const [surfaceContext, setSurfaceContext] = useState<SurfaceType[]>(initialProfile.surfaceContext);
  const [toleranceProfile, setToleranceProfile] = useState<ToleranceProfile>(initialProfile.toleranceProfile);
  const [primaryGoalType, setPrimaryGoalType] = useState<GoalType>(initialProfile.primaryGoalType);
  const [primaryGoalLabel, setPrimaryGoalLabel] = useState(initialProfile.primaryGoalLabel);
  const [primaryGoalDate, setPrimaryGoalDate] = useState(initialProfile.primaryGoalDate);
  const [secondaryGoalType, setSecondaryGoalType] = useState<GoalType>(initialProfile.secondaryGoalType);
  const [secondaryGoalLabel, setSecondaryGoalLabel] = useState(initialProfile.secondaryGoalLabel);
  const [secondaryGoalDate, setSecondaryGoalDate] = useState(initialProfile.secondaryGoalDate);
  const [goalNotes, setGoalNotes] = useState(initialProfile.goalNotes);
  const [preferredQualityStyle, setPreferredQualityStyle] = useState<PreferredQualityStyle>(initialProfile.preferredQualityStyle);
  const [avoidClassicIntervals, setAvoidClassicIntervals] = useState(initialProfile.avoidClassicIntervals);
  const [monthlyLongRunRule, setMonthlyLongRunRule] = useState(initialProfile.monthlyLongRunRule);
  const [longRunDayPreference, setLongRunDayPreference] = useState<LongRunDayPreference>(initialProfile.longRunDayPreference);
  const [executionPreference, setExecutionPreference] = useState<ExecutionPreference>(initialProfile.executionPreference);
  const [constraintNotes, setConstraintNotes] = useState(initialProfile.constraintNotes);
  const [scheduleConstraints, setScheduleConstraints] = useState(initialProfile.scheduleConstraints);
  const [notes, setNotes] = useState(initialProfile.notes);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = useMemo(() => availabilityDays.length > 0 && preferredSessionStyles.length > 0 && surfaceContext.length > 0, [availabilityDays, preferredSessionStyles, surfaceContext]);

  function handleSave() {
    if (!isValid) {
      setError("Completá al menos disponibilidad, estilo y superficie principal.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availabilityDays,
          preferredIntensityModel,
          preferredSessionStyles,
          surfaceContext,
          toleranceProfile,
          primaryGoalType,
          primaryGoalLabel,
          primaryGoalDate,
          secondaryGoalType,
          secondaryGoalLabel,
          secondaryGoalDate,
          goalNotes,
          preferredQualityStyle,
          avoidClassicIntervals,
          monthlyLongRunRule,
          longRunDayPreference,
          executionPreference,
          constraintNotes,
          scheduleConstraints,
          notes,
        }),
      });

      if (!response.ok) {
        setSaved(false);
        setError("No pudimos guardar el perfil del atleta.");
        return;
      }

      setSaved(true);
      router.refresh();
      window.setTimeout(() => setSaved(false), 1500);
    });
  }

  return (
    <div className="ros-panel p-7 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <span className="ros-module-title">Perfil del atleta</span>
          <span className="font-sans text-sm text-ros-muted max-w-[58ch]">
            Configurá cómo entrenás, qué objetivo perseguís y qué reglas personales no querés que el sistema ignore.
          </span>
        </div>
        {saved ? (
          <span className="ros-status-badge border-ros-green/20 bg-ros-green/10 text-ros-green">Guardado</span>
        ) : null}
      </div>

      {error ? (
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-ros-red">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-[9px] text-ros-mid tracking-[0.22em] uppercase">Días disponibles</span>
          <div className="ros-toggle-group">
            {DAY_OPTIONS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setAvailabilityDays((current) => toggleValue(current, value))}
                className={`ros-chip ${availabilityDays.includes(value) ? "ros-chip-active" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="font-mono text-[9px] text-ros-mid tracking-[0.22em] uppercase">Modelo de intensidad</span>
          <div className="ros-toggle-group">
            {INTENSITY_OPTIONS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPreferredIntensityModel(value)}
                className={`ros-chip ${preferredIntensityModel === value ? "ros-chip-active" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="font-mono text-[9px] text-ros-mid tracking-[0.22em] uppercase">Estilos preferidos</span>
          <div className="ros-toggle-group">
            {STYLE_OPTIONS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPreferredSessionStyles((current) => toggleValue(current, value))}
                className={`ros-chip ${preferredSessionStyles.includes(value) ? "ros-chip-active" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="font-mono text-[9px] text-ros-mid tracking-[0.22em] uppercase">Superficies / contexto</span>
          <div className="ros-toggle-group">
            {SURFACE_OPTIONS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setSurfaceContext((current) => toggleValue(current, value))}
                className={`ros-chip ${surfaceContext.includes(value) ? "ros-chip-active" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:col-span-2">
          <span className="font-mono text-[9px] text-ros-mid tracking-[0.22em] uppercase">Perfil de tolerancia</span>
          <div className="ros-toggle-group">
            {TOLERANCE_OPTIONS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setToleranceProfile(value)}
                className={`ros-chip ${toleranceProfile === value ? "ros-chip-active" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-mono text-[9px] text-ros-mid tracking-[0.22em] uppercase">
            Restricciones reales
          </label>
          <input
            value={scheduleConstraints}
            onChange={(event) => setScheduleConstraints(event.target.value)}
            className="ros-input"
            placeholder="Ej: solo 60 min de lunes a viernes, largo el sábado"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-mono text-[9px] text-ros-mid tracking-[0.22em] uppercase">
            Notas útiles
          </label>
          <input
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="ros-input"
            placeholder="Ej: prefiero steady a series clásicas"
          />
        </div>
      </div>

      <div className="h-px bg-white/[0.06]" />

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span className="ros-module-title">Objetivos y horizonte</span>
          <span className="font-sans text-sm text-ros-muted max-w-[58ch]">
            Esto le da al sistema un foco temporal real: qué carrera manda hoy y cuál queda en espera.
          </span>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="ros-panel-muted px-5 py-5">
            <div className="mb-4 font-mono text-[9px] text-ros-mid tracking-[0.22em] uppercase">Objetivo principal</div>
            <div className="grid gap-4">
              <div className="ros-toggle-group">
                {GOAL_TYPE_OPTIONS.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPrimaryGoalType(value)}
                    className={`ros-chip ${primaryGoalType === value ? "ros-chip-active" : ""}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <input
                value={primaryGoalLabel}
                onChange={(event) => setPrimaryGoalLabel(event.target.value)}
                className="ros-input"
                placeholder="Ej: Maratón sub 3 en Buenos Aires"
              />
              <input
                value={primaryGoalDate}
                onChange={(event) => setPrimaryGoalDate(event.target.value)}
                type="date"
                className="ros-input"
              />
            </div>
          </div>

          <div className="ros-panel-muted px-5 py-5">
            <div className="mb-4 font-mono text-[9px] text-ros-mid tracking-[0.22em] uppercase">Objetivo secundario</div>
            <div className="grid gap-4">
              <div className="ros-toggle-group">
                {GOAL_TYPE_OPTIONS.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSecondaryGoalType(value)}
                    className={`ros-chip ${secondaryGoalType === value ? "ros-chip-active" : ""}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <input
                value={secondaryGoalLabel}
                onChange={(event) => setSecondaryGoalLabel(event.target.value)}
                className="ros-input"
                placeholder="Ej: Backyard de noviembre"
              />
              <input
                value={secondaryGoalDate}
                onChange={(event) => setSecondaryGoalDate(event.target.value)}
                type="date"
                className="ros-input"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 xl:col-span-2">
            <label className="font-mono text-[9px] text-ros-mid tracking-[0.22em] uppercase">
              Notas del objetivo
            </label>
            <input
              value={goalNotes}
              onChange={(event) => setGoalNotes(event.target.value)}
              className="ros-input"
              placeholder="Ej: el maratón manda toda la construcción, backyard queda como objetivo secundario"
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-white/[0.06]" />

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span className="ros-module-title">Reglas personales</span>
          <span className="font-sans text-sm text-ros-muted max-w-[58ch]">
            Guardá preferencias y restricciones reales para que la recomendación diaria deje de sonar genérica.
          </span>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[9px] text-ros-mid tracking-[0.22em] uppercase">Estilo de calidad</span>
            <div className="ros-toggle-group">
              {QUALITY_STYLE_OPTIONS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPreferredQualityStyle(value)}
                  className={`ros-chip ${preferredQualityStyle === value ? "ros-chip-active" : ""}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-mono text-[9px] text-ros-mid tracking-[0.22em] uppercase">Preferencia de ejecución</span>
            <div className="ros-toggle-group">
              {EXECUTION_OPTIONS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setExecutionPreference(value)}
                  className={`ros-chip ${executionPreference === value ? "ros-chip-active" : ""}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-mono text-[9px] text-ros-mid tracking-[0.22em] uppercase">Día preferido para el fondo</span>
            <div className="ros-toggle-group">
              {LONG_RUN_DAY_OPTIONS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLongRunDayPreference(value)}
                  className={`ros-chip ${longRunDayPreference === value ? "ros-chip-active" : ""}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setAvoidClassicIntervals((current) => !current)}
              className={`ros-chip justify-center ${avoidClassicIntervals ? "ros-chip-active" : ""}`}
            >
              Evitar intervalos clásicos
            </button>
            <button
              type="button"
              onClick={() => setMonthlyLongRunRule((current) => !current)}
              className={`ros-chip justify-center ${monthlyLongRunRule ? "ros-chip-active" : ""}`}
            >
              42K mensual estructural
            </button>
          </div>

          <div className="flex flex-col gap-2 xl:col-span-2">
            <label className="font-mono text-[9px] text-ros-mid tracking-[0.22em] uppercase">
              Notas de restricciones / reglas
            </label>
            <input
              value={constraintNotes}
              onChange={(event) => setConstraintNotes(event.target.value)}
              className="ros-input"
              placeholder="Ej: el fondo casi siempre va el sábado y la calidad me funciona mejor en steady"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="font-sans text-sm text-ros-muted">
          Este bloque ya le da al sistema un contexto más real: quién sos, qué objetivo manda y qué reglas personales no debería romper.
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="ros-button-primary disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Guardar perfil"}
        </button>
      </div>
    </div>
  );
}
