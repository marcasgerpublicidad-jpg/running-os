"use client";

import type { DataSource } from "@/lib/dashboardData";

interface DataSourceBadgeProps {
  source: DataSource;
}

export default function DataSourceBadge({ source }: DataSourceBadgeProps) {
  const isStrava = source === "strava";

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {/* Source pill */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 border font-mono text-[9px]
                      tracking-[0.14em] uppercase
                      ${isStrava
                        ? "border-ros-green/30 text-ros-green bg-ros-green/5"
                        : "border-ros-faint text-ros-muted bg-ros-faint/10"}`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${isStrava ? "bg-ros-green animate-pulse" : "bg-ros-muted"}`}
          />
          {isStrava ? "Datos en vivo · Strava" : "Datos demo"}
        </div>

        {/* Connect CTA when not connected */}
        {!isStrava && (
          <a
            href="/api/auth/strava"
            className="font-mono text-[9px] text-ros-mid tracking-[0.12em] uppercase
                       border-b border-ros-faint pb-px hover:text-ros-text hover:border-ros-muted
                       transition-colors"
          >
            Conectar Strava →
          </a>
        )}
      </div>

      {/* Disconnect link when connected */}
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
      className="font-mono text-[9px] text-ros-faint tracking-[0.1em] uppercase
                 hover:text-ros-muted transition-colors cursor-pointer bg-transparent border-none"
    >
      Desconectar
    </button>
  );
}
