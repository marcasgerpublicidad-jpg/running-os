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
      { label: "Configuración", href: "/settings" },
    ],
  },
];

export default function Sidebar({ athlete, activeRoute = "/dashboard" }: SidebarProps) {
  return (
    <aside className="flex flex-col bg-ros-surface border-r border-ros-border overflow-hidden">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-ros-border">
        <Logo />
      </div>

      {/* Athlete card */}
      <div className="px-6 py-5 border-b border-ros-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-ros-faint border border-ros-border2 flex items-center justify-center flex-shrink-0">
            <span className="font-mono text-[13px] font-bold text-ros-muted">
              {athlete.initials}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-sans text-[13px] font-medium text-ros-bright leading-none truncate">
              {athlete.name}
            </div>
            <div className="font-mono text-[9px] text-ros-mid tracking-[0.12em] uppercase mt-1">
              {athlete.goal}
            </div>
          </div>
          {/* Online dot */}
          <div className="w-[7px] h-[7px] rounded-full bg-ros-green animate-pulse-dot flex-shrink-0"
               style={{ boxShadow: "0 0 6px rgba(74,222,128,0.5)" }} />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV_ITEMS.map((group, gi) => (
          <div key={gi}>
            <div className="px-6 pt-3 pb-1.5 font-mono text-[9px] font-medium text-ros-faint tracking-[0.22em] uppercase">
              {group.section}
            </div>
            {group.items.map((item) => {
              const isActive = activeRoute === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2.5 px-6 py-[9px] border-l-2 transition-colors duration-150
                    ${isActive
                      ? "bg-white/5 border-ros-bright"
                      : "border-transparent hover:bg-white/[0.03]"}
                  `}
                >
                  <span className={`font-mono text-[11px] tracking-[0.06em] flex-1
                    ${isActive ? "text-ros-bright" : "text-ros-muted"}`}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-sm tracking-[0.05em]
                      ${isActive
                        ? "bg-ros-green text-ros-bg"
                        : "bg-ros-faint text-ros-muted"}`}>
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-ros-border">
        <div className="font-mono text-[9px] text-ros-mid tracking-[0.1em] uppercase leading-[1.8]">
          Semana {athlete.currentWeek} · {athlete.currentCycle}
          <br />
          Próximo test: 14 días
        </div>
      </div>
    </aside>
  );
}
