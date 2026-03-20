"use client";

import { useMemo, useState } from "react";
import {
  POST_WORKOUT_FEEDBACK_KEY,
  getPostWorkoutFeedbackTodayISO,
  type MuscleTightness,
  type PostWorkoutFeeling,
  type PostWorkoutFeedbackPayload,
} from "@/lib/postWorkoutFeedbackShared";

interface PostWorkoutFeedbackFormProps {
  initialFeedback?: PostWorkoutFeedbackPayload | null;
}

const FEELING_OPTIONS: Array<{ value: PostWorkoutFeeling; label: string }> = [
  { value: "liviano", label: "Liviano" },
  { value: "solido", label: "Sólido" },
  { value: "duro", label: "Duro" },
  { value: "vacio", label: "Vacío" },
];

const TIGHTNESS_OPTIONS: Array<{ value: MuscleTightness; label: string }> = [
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
];

export default function PostWorkoutFeedbackForm({ initialFeedback = null }: PostWorkoutFeedbackFormProps) {
  const date = useMemo(() => getPostWorkoutFeedbackTodayISO(), []);
  const [completed, setCompleted] = useState<boolean>(initialFeedback?.completed ?? true);
  const [rpe, setRpe] = useState<number>(initialFeedback?.rpe ?? 6);
  const [felt, setFelt] = useState<PostWorkoutFeeling>(initialFeedback?.felt ?? "solido");
  const [muscleTightness, setMuscleTightness] = useState<MuscleTightness>(initialFeedback?.muscleTightness ?? "media");
  const [didActivation, setDidActivation] = useState<boolean>(initialFeedback?.didActivation ?? false);
  const [didRecovery, setDidRecovery] = useState<boolean>(initialFeedback?.didRecovery ?? false);
  const [notes, setNotes] = useState<string>(initialFeedback?.notes ?? "");
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const payload: PostWorkoutFeedbackPayload = {
      date,
      completed,
      rpe: Math.round(rpe),
      felt,
      muscleTightness,
      didActivation,
      didRecovery,
      notes: notes.trim(),
      updatedAt: new Date().toISOString(),
    };

    setError(null);

    const response = await fetch("/api/post-workout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setSaved(false);
      setError("No pudimos guardar el feedback post-entreno.");
      return;
    }

    localStorage.setItem(POST_WORKOUT_FEEDBACK_KEY, JSON.stringify(payload));
    setSaved(true);
    window.dispatchEvent(new Event("post-workout:saved"));
    window.setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="ros-panel p-7 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <span className="ros-module-title">Cerrar sesión</span>
          <span className="font-sans text-sm text-ros-muted max-w-[58ch]">
            Un cierre corto post-entreno para capturar cómo salió de verdad la sesión y si completaste activación o descarga.
          </span>
        </div>
        {saved ? (
          <span className="ros-status-badge border-ros-green/20 bg-ros-green/10 text-ros-green">
            Guardado
          </span>
        ) : null}
      </div>

      {error ? (
        <div className="font-mono text-[10px] text-ros-red tracking-[0.12em] uppercase">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="font-mono text-[9px] text-ros-mid tracking-[0.22em] uppercase">Sesión completada</label>
          <div className="ros-toggle-group">
            <button type="button" onClick={() => setCompleted(true)} className={`ros-chip ${completed ? "ros-chip-active" : ""}`}>Sí</button>
            <button type="button" onClick={() => setCompleted(false)} className={`ros-chip ${!completed ? "ros-chip-active" : ""}`}>No</button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-mono text-[9px] text-ros-mid tracking-[0.22em] uppercase">Cómo se sintió</label>
          <div className="ros-toggle-group">
            {FEELING_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFelt(option.value)}
                className={`ros-chip ${felt === option.value ? "ros-chip-active" : ""}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="font-mono text-[9px] text-ros-mid tracking-[0.22em] uppercase">RPE (1-10)</label>
          <div className="font-sans text-xs text-ros-muted leading-5">
            Percepción del esfuerzo: 1 muy fácil, 10 máximo.
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={rpe}
            onChange={(event) => setRpe(Number(event.target.value))}
            className="accent-[#b8c0cc]"
          />
          <div className="font-sans text-[14px] font-medium text-ros-text tracking-[-0.02em]">
            {Math.round(rpe)} / 10
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-mono text-[9px] text-ros-mid tracking-[0.22em] uppercase">Rigidez muscular</label>
          <div className="ros-toggle-group">
            {TIGHTNESS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMuscleTightness(option.value)}
                className={`ros-chip ${muscleTightness === option.value ? "ros-chip-active" : ""}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="font-mono text-[9px] text-ros-mid tracking-[0.22em] uppercase">¿Hiciste activación?</label>
          <div className="ros-toggle-group">
            <button type="button" onClick={() => setDidActivation(true)} className={`ros-chip ${didActivation ? "ros-chip-active" : ""}`}>Sí</button>
            <button type="button" onClick={() => setDidActivation(false)} className={`ros-chip ${!didActivation ? "ros-chip-active" : ""}`}>No</button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-mono text-[9px] text-ros-mid tracking-[0.22em] uppercase">¿Hiciste descarga?</label>
          <div className="ros-toggle-group">
            <button type="button" onClick={() => setDidRecovery(true)} className={`ros-chip ${didRecovery ? "ros-chip-active" : ""}`}>Sí</button>
            <button type="button" onClick={() => setDidRecovery(false)} className={`ros-chip ${!didRecovery ? "ros-chip-active" : ""}`}>No</button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-mono text-[9px] text-ros-mid tracking-[0.22em] uppercase">Nota breve</label>
        <input
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="ros-input"
          placeholder="Ej: costó sostener el ritmo, piernas cargadas al final"
        />
      </div>

      <button onClick={handleSave} className="ros-button-primary">
        Guardar feedback
      </button>
    </div>
  );
}
