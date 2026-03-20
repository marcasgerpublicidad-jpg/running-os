"use client";

import { useEffect, useMemo, useState } from "react";
import {
  POST_WORKOUT_FEEDBACK_KEY,
  getPostWorkoutFeedbackTodayISO,
  safeParsePostWorkoutFeedback,
  type PostWorkoutFeedbackPayload,
} from "@/lib/postWorkoutFeedbackShared";

interface PostWorkoutFeedbackStatusProps {
  initialFeedback?: PostWorkoutFeedbackPayload | null;
}

const FEELING_LABELS: Record<PostWorkoutFeedbackPayload["felt"], string> = {
  liviano: "Liviano",
  solido: "Sólido",
  duro: "Duro",
  vacio: "Vacío",
};

const TIGHTNESS_LABELS: Record<PostWorkoutFeedbackPayload["muscleTightness"], string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
};

export default function PostWorkoutFeedbackStatus({ initialFeedback = null }: PostWorkoutFeedbackStatusProps) {
  const date = useMemo(() => getPostWorkoutFeedbackTodayISO(), []);
  const [payload, setPayload] = useState<PostWorkoutFeedbackPayload | null>(initialFeedback);

  useEffect(() => {
    const load = () => {
      const raw = localStorage.getItem(POST_WORKOUT_FEEDBACK_KEY);
      const parsed = safeParsePostWorkoutFeedback(raw);
      setPayload(parsed && parsed.date === date ? parsed : null);
    };

    load();
    window.addEventListener("post-workout:saved", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("post-workout:saved", load);
      window.removeEventListener("storage", load);
    };
  }, [date]);

  return (
    <div className="ros-panel p-7">
      <div className="flex items-center justify-between">
        <span className="ros-module-title">Post-workout feedback</span>
        {payload ? (
          <span className="ros-status-badge border-ros-green/20 bg-ros-green/10 text-ros-green">
            Guardado
          </span>
        ) : (
          <span className="font-mono text-[9px] text-ros-faint tracking-[0.18em] uppercase">
            Pendiente
          </span>
        )}
      </div>

      {payload ? (
        <div className="mt-4 grid gap-2">
          <div className="font-sans text-sm text-ros-text leading-6">
            RPE {payload.rpe}/10 · Sensación {FEELING_LABELS[payload.felt]} · Rigidez {TIGHTNESS_LABELS[payload.muscleTightness]}
          </div>
          <div className="font-sans text-sm text-ros-muted leading-6">
            Activación: {payload.didActivation ? "Sí" : "No"} · Descarga: {payload.didRecovery ? "Sí" : "No"}
          </div>
          {payload.notes ? (
            <div className="font-sans text-sm text-ros-muted leading-6">{payload.notes}</div>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 font-sans text-sm text-ros-muted leading-6">
          Cerrá cómo se sintió la sesión cuando terminás. Este feedback va a pasar a ser una señal más importante que el input manual previo.
        </div>
      )}
    </div>
  );
}
