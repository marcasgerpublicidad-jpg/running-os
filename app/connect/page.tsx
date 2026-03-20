/**
 * app/connect/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Strava connection page — shown when the user hasn't connected yet,
 * or when an OAuth error occurs.
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface ConnectPageProps {
  // `searchParams` viene como objeto (no como Promise) en App Router.
  // Lo tipamos de forma conservadora para evitar imports internos de Next.
  searchParams: Record<string, string | string[] | undefined>;
}

const ERROR_MESSAGES: Record<string, string> = {
  denied:         "Acceso denegado. No se otorgaron permisos a Running OS.",
  no_code:        "No se recibió código de autorización de Strava.",
  token_exchange: "Error al completar la autenticación. Intentá de nuevo.",
  config:         "Strava no está configurado en este entorno. Completá STRAVA_CLIENT_ID/STRAVA_CLIENT_SECRET/STRAVA_REDIRECT_URI.",
};

export default function ConnectPage({ searchParams }: ConnectPageProps) {
  const errorKey = searchParams?.error as string | undefined;
  const errorMsg = errorKey ? ERROR_MESSAGES[errorKey] ?? "Error desconocido." : null;

  return (
    <div className="min-h-screen bg-ros-bg flex items-center justify-center p-8">
      <div className="max-w-md w-full">

        {/* Logo */}
        <div className="mb-12">
          <div className="font-mono text-[11px] font-bold text-ros-bright tracking-[0.08em] uppercase mb-1">
            RUNNING OS
          </div>
          <div className="font-mono text-[9px] text-ros-mid tracking-[0.2em] uppercase">
            Athlete Operating System
          </div>
        </div>

        {/* Card */}
        <div className="bg-ros-card border border-ros-border p-8">

          <div className="font-mono text-[9px] text-ros-mid tracking-[0.22em] uppercase mb-4">
            Fuente de datos
          </div>

          <h1 className="font-mono text-[22px] font-bold text-ros-bright leading-tight mb-3">
            Conectar<br />Strava
          </h1>

          <p className="font-mono text-[11px] text-ros-muted tracking-[0.04em] leading-[1.7] mb-8">
            Running OS necesita acceso a tus actividades de Strava para calcular
            ATL, CTL y TSB en tiempo real. Solo se solicitan permisos de lectura.
          </p>

          {/* Error message */}
          {errorMsg && (
            <div className="border border-ros-red/30 bg-ros-red/5 px-4 py-3 mb-6">
              <div className="font-mono text-[10px] text-ros-red tracking-[0.06em]">
                {errorMsg}
              </div>
            </div>
          )}

          {/* Permissions list */}
          <div className="mb-8 flex flex-col gap-2">
            {[
              "Leer actividades de entrenamiento",
              "Acceder a datos de frecuencia cardíaca",
              "Ver historial de actividades (90 días)",
            ].map((perm) => (
              <div key={perm} className="flex items-center gap-2.5">
                <div className="w-1 h-1 rounded-full bg-ros-green flex-shrink-0" />
                <span className="font-mono text-[10px] text-ros-muted tracking-[0.04em]">
                  {perm}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href="/api/auth/strava"
            className="block w-full bg-ros-bright text-ros-bg font-mono text-[11px] font-bold
                       tracking-[0.18em] uppercase py-3 text-center
                       hover:opacity-85 transition-opacity"
          >
            Autorizar con Strava →
          </a>

          {/* Skip to demo */}
          <a
            href="/dashboard"
            className="block text-center mt-4 font-mono text-[9px] text-ros-faint
                       tracking-[0.12em] uppercase hover:text-ros-muted transition-colors"
          >
            Continuar con datos demo
          </a>
        </div>

        {/* Footer note */}
        <p className="font-mono text-[9px] text-ros-faint tracking-[0.08em] leading-[1.6] mt-6">
          Running OS nunca almacena tus tokens en una base de datos.
          Los tokens se guardan en cookies httpOnly en tu navegador
          y son eliminados al desconectar.
        </p>

      </div>
    </div>
  );
}
