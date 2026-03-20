"use client";

import Logo from "./Logo";
import type { Athlete } from "@/lib/data";

interface SidebarProps {
  athlete:      Athlete;
  activeRoute?: string;
}

const NAV_ITEMS = [
  {
    section: "Sistema",
    items: [
      { label: "Dashboard",     href: "/dashboard", badge: "HOY" },
      { label: "Actividades",   href: "/activities" },
      { label: "Plan semanal",  href: "/plan" },
    ],
  },
  {
    section: "Análisis",
    items: [
      { label: "Carga (PMC)",   href: "/pmc" },
      { label: "Recuperación",  href: "/recovery" },
      { label: "Historial",     href: "/history" },
    ],
  },
  {
    section: "Sistema",
    items: [
      { label: "Perfil atleta", href: "/profile" },
    ],
  },
];

export default function Sidebar({ athlete, activeRoute = "/dashboard" }: SidebarProps) {
  return (
    <aside className="relative flex flex-col overflow-hidden border-r border-white/[0.06] bg-[#090b0d]/95 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/[0.08] to-transparent" />
      <div className="pointer-events-none absolute left-0 top-0 h-48 w-full bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.07),transparent_44%)] opacity-70" />

      <div className="px-8 py-8 border-b border-white/[0.06]">
        <Logo />
      </div>

      <div className="mx-5 mt-5 rounded-[3px] border border-white/[0.07] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] px-5 py-5 shadow-[0_18px_40px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="mb-3 font-mono text-[8px] text-ros-faint tracking-[0.28em] uppercase">
          Perfil del atleta
        </div>
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center border border-white/[0.08] bg-white/[0.04] flex-shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <span className="font-mono text-[12px] font-semibold text-ros-steel">
              {athlete.initials}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-sans text-[14px] font-semibold text-ros-bright leading-none truncate tracking-[-0.03em]">
              {athlete.name}
            </div>
            <div className="font-mono text-[8px] text-ros-mid tracking-[0.22em] uppercase mt-1.5">
              {athlete.goal}
            </div>
          </div>
          <div className="h-[7px] w-[7px] rounded-full bg-ros-green animate-pulse-dot flex-shrink-0" />
        </div>
      </div>

      <nav className="flex-1 py-6 overflow-y-auto">
        {NAV_ITEMS.map((group, gi) => (
          <div key={gi} className="mb-4">
            <div className="px-8 pt-2 pb-2 font-mono text-[8px] font-medium text-ros-faint tracking-[0.30em] uppercase">
              {group.section}
            </div>
            {group.items.map((item) => {
              const isActive = activeRoute === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`
                    mx-3 flex items-center gap-3 px-5 py-3.5 border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/14
                    ${isActive
                      ? "border-white/[0.14] bg-[linear-gradient(180deg,rgba(212,220,230,0.12),rgba(255,255,255,0.04))] shadow-[0_16px_30px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(184,192,204,0.08)]"
                      : "border-transparent hover:border-white/[0.06] hover:bg-white/[0.025]"}
                  `}
                >
                  <span className={`h-px w-4 ${isActive ? "bg-white/[0.24]" : "bg-white/[0.07]"}`} />
                  <span className={`font-mono text-[11px] tracking-[0.12em] uppercase flex-1
                    ${isActive ? "text-ros-bright" : "text-ros-muted"}`}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className={`font-mono text-[8px] px-2 py-1 tracking-[0.16em] uppercase
                      ${isActive
                        ? "bg-ros-green/20 text-ros-green border border-ros-green/20"
                        : "bg-white/[0.03] text-ros-muted border border-white/[0.06]"}`}>
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="px-8 py-5 border-t border-white/[0.06]">
        <div className="font-mono text-[8px] text-ros-mid tracking-[0.18em] uppercase leading-[1.9]">
          Semana {athlete.currentWeek} · {athlete.currentCycle}
          <br />
          Próximo test: 14 días
        </div>
      </div>
    </aside>
  );
}
