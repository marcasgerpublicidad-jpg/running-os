"use client";

import { useMemo, useState } from "react";
import {
  CHECKIN_KEY,
  getCheckInTodayISO,
  getQuickCheckInLabel,
  getQuickCheckInPreset,
  type CheckInDecision,
  type CheckInPayload,
  type QuickCheckInStatus,
} from "@/lib/checkinShared";

interface CheckInFormProps {
  initialCheckIn?: CheckInPayload | null;
}

export default function CheckInForm({ initialCheckIn = null }: CheckInFormProps) {
  const [decision, setDecision] = useState<CheckInDecision>(initialCheckIn?.decision ?? "mantener");
  const [subjectiveScore, setSubjectiveScore] = useState<number>(initialCheckIn?.subjectiveScore ?? 50);
  const [quickStatus, setQuickStatus] = useState<QuickCheckInStatus>(initialCheckIn?.quickStatus ?? "voy-bien");
  const [showAdvanced, setShowAdvanced] = useState<boolean>(initialCheckIn?.mode === "advanced");
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const date = useMemo(() => getCheckInTodayISO(), []);

  async function savePayload(payload: CheckInPayload) {
    setError(null);

    const response = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setSaved(false);
      setError("No pudimos guardar el check-in.");
      return;
    }

    localStorage.setItem(CHECKIN_KEY, JSON.stringify(payload));
    setSaved(true);
    window.dispatchEvent(new Event("checkin:saved"));
    window.setTimeout(() => setSaved(false), 1500);
  }

  async function handleQuickSave() {
    const preset = getQuickCheckInPreset(quickStatus);
    const payload: CheckInPayload = {
      date,
      decision: preset.decision,
      subjectiveScore: preset.subjectiveScore,
      mode: "quick",
      quickStatus,
      updatedAt: new Date().toISOString(),
    };

    await savePayload(payload);
  }

  async function handleAdvancedSave() {
    const payload: CheckInPayload = {
      date,
      decision,
      subjectiveScore: Math.round(subjectiveScore),
      mode: "advanced",
      quickStatus: null,
      updatedAt: new Date().toISOString(),
    };

    await savePayload(payload);
  }

  return (
    <div className="ros-panel p-7 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <span className="ros-module-title">
            Check-in híbrido
          </span>
          <span className="font-sans text-sm text-ros-muted max-w-[58ch]">
            El input previo ya no manda solo. Usalo como modulación rápida del día o abrí el ajuste manual avanzado si realmente necesitás override.
          </span>
        </div>
        {saved && (
          <span className="ros-status-badge border-ros-green/20 bg-ros-green/10 text-ros-green">
            Guardado
          </span>
        )}
      </div>

      {error ? (
        <div className="font-mono text-[10px] text-ros-red tracking-[0.12em] uppercase">
          {error}
        </div>
      ) : null}

      <div className="ros-panel-muted px-5 py-5 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[9px] text-ros-mid tracking-[0.22em] uppercase">
            Pre-check-in rápido
          </span>
          <span className="font-mono text-[12px] text-ros-bright tracking-[0.08em]">{date}</span>
        </div>

        <div className="ros-toggle-group">
          {(["voy-bien", "ajustar", "muy-cargado"] as QuickCheckInStatus[]).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setQuickStatus(status)}
              className={`ros-chip ${quickStatus === status ? "ros-chip-active" : ""}`}
            >
              {getQuickCheckInLabel(status)}
            </button>
          ))}
        </div>

        <div className="font-sans text-sm text-ros-muted leading-6">
          Esto sólo modula fino la sesión de hoy. La señal post-entreno reciente pesa más que este input rápido.
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handleQuickSave}
            className="ros-button-primary"
          >
            Guardar pre-check-in rápido
          </button>
          <button
            type="button"
            onClick={() => setShowAdvanced((current) => !current)}
            className="ros-button"
          >
            {showAdvanced ? "Ocultar override manual" : "Abrir override manual"}
          </button>
        </div>
      </div>

      {showAdvanced ? (
        <div className="ros-panel-muted px-5 py-5 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[9px] text-ros-mid tracking-[0.22em] uppercase">
              Ajuste manual avanzado
            </span>
            <span className="font-sans text-sm text-ros-muted max-w-[56ch]">
              Este bloque sobrevive como override premium. Si lo guardás, pasa a tener prioridad final sobre las demás señales.
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono text-[9px] text-ros-mid tracking-[0.22em] uppercase">
              Decisión
            </label>
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value as CheckInDecision)}
              className="ros-input"
            >
              <option value="mantener">Mantener</option>
              <option value="bajar">Bajar</option>
              <option value="regenerativo">Regenerativo</option>
              <option value="descanso">Descanso</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono text-[9px] text-ros-mid tracking-[0.22em] uppercase">
              Sensación (0-100)
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={subjectiveScore}
              onChange={(e) => setSubjectiveScore(Number(e.target.value))}
              className="accent-[#b8c0cc]"
            />
            <div className="font-sans text-[14px] font-medium text-ros-text tracking-[-0.02em]">
              {Math.round(subjectiveScore)} / 100
            </div>
          </div>

          <button
            onClick={handleAdvancedSave}
            className="ros-button-primary"
          >
            Guardar override manual
          </button>
        </div>
      ) : null}
    </div>
  );
}
