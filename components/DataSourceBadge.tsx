"use client";

import type { DataSource, TrainingDataReason } from "@/lib/dashboardData";

interface DataSourceBadgeProps {
  source: DataSource;
  connectionStatus: TrainingDataReason;
  message?: string | null;
}

export default function DataSourceBadge({ source, connectionStatus, message }: DataSourceBadgeProps) {
  const isStrava = source === "strava";
  const isReconnectState =
    connectionStatus === "not_connected" || connectionStatus === "token_invalid";
  const statusLabel = isStrava
    ? "Strava conectada"
    : source === "not_connected" || isReconnectState
      ? "Fallback activo · sin conexion"
      : "Fallback activo · error de Strava";

  return (
    <div className="ros-panel flex items-start justify-between px-5 py-4 animate-fade-rise">
      <div className="flex items-center gap-3">
        <div
          className={`ros-status-badge
                      ${isStrava
                        ? "border-ros-green/25 text-ros-green bg-[linear-gradient(180deg,rgba(136,184,154,0.12),rgba(136,184,154,0.05))]"
                        : "border-ros-amber/25 text-ros-amber bg-[linear-gradient(180deg,rgba(183,154,105,0.16),rgba(183,154,105,0.06))]"}`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${isStrava ? "bg-ros-green animate-pulse-dot" : "bg-ros-amber"}`}
          />
          {statusLabel}
        </div>

        {message ? (
          <div className="max-w-[620px] font-sans text-sm leading-6 text-ros-muted">
            {message}
          </div>
        ) : null}

        {isReconnectState && (
          <a
            href="/api/auth/strava"
            className="ros-button"
          >
            Conectar Strava
          </a>
        )}
      </div>

      {isStrava && (
        <DisconnectButton />
      )}
    </div>
  );
}

function DisconnectButton() {
  async function handleDisconnect() {
    await fetch("/api/strava/disconnect", { method: "POST" });
    window.location.reload();
  }

  return (
    <button
      onClick={handleDisconnect}
      className="ros-button"
    >
      Desconectar
    </button>
  );
}
