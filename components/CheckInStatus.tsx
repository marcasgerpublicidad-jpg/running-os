"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CHECKIN_KEY,
  getCheckInTodayISO,
  getQuickCheckInLabel,
  safeParseCheckIn,
  type CheckInDecision,
  type CheckInPayload,
} from "@/lib/checkinShared";

function decisionToLabel(d: CheckInDecision): string {
  switch (d) {
    case "mantener":
      return "Mantener";
    case "bajar":
      return "Bajar";
    case "regenerativo":
      return "Regenerativo";
    case "descanso":
      return "Descanso";
    default:
      return "—";
  }
}

interface CheckInStatusProps {
  initialCheckIn?: CheckInPayload | null;
}

export default function CheckInStatus({ initialCheckIn = null }: CheckInStatusProps) {
  const date = useMemo(() => getCheckInTodayISO(), []);
  const [payload, setPayload] = useState<CheckInPayload | null>(initialCheckIn);

  useEffect(() => {
    const load = () => {
      const raw = localStorage.getItem(CHECKIN_KEY);
      const parsed = safeParseCheckIn(raw);
      setPayload(parsed && parsed.date === date ? parsed : null);
    };

    load();
    window.addEventListener("checkin:saved", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("checkin:saved", load);
      window.removeEventListener("storage", load);
    };
  }, [date]);

  return (
    <div className="ros-panel p-7">
      <div className="flex items-center justify-between">
        <span className="ros-module-title">
          Check-in (hoy)
        </span>
        {payload ? (
          <span className="ros-status-badge border-white/[0.08] bg-white/[0.03] text-ros-bright">
            {payload.mode === "quick" && payload.quickStatus
              ? getQuickCheckInLabel(payload.quickStatus)
              : decisionToLabel(payload.decision)}
          </span>
        ) : (
          <span className="font-mono text-[9px] text-ros-faint tracking-[0.18em] uppercase">
            Sin check-in
          </span>
        )}
      </div>

      {payload ? (
        <div className="mt-4 font-sans text-sm text-ros-muted leading-6">
          {payload.mode === "advanced" ? "Override manual activo" : "Pre-check-in rápido guardado"}
          <br />
          Sensación: {Math.round(payload.subjectiveScore)} / 100
          <br />
          Actualizado: {new Date(payload.updatedAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
        </div>
      ) : (
        <div className="mt-4 font-sans text-sm text-ros-muted leading-6">
          Guardá un pre-check-in rápido para modular el día o abrí el override manual si necesitás una decisión más explícita.
        </div>
      )}
    </div>
  );
}
