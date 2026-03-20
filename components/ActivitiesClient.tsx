"use client";
import { useState, useMemo } from "react";
import type { Activity } from "@/lib/strava";
import type { DataSource, TrainingDataReason } from "@/lib/dashboardData";
interface Props {
  activities: Activity[];
  source: DataSource;
  reason: TrainingDataReason;
  connectionStatus: TrainingDataReason;
  message: string | null;
  title?: string;
  kicker?: string;
}
function formatPace(m: number): string { if (!m||m<=0) return "—"; const mins=Math.floor(m); const secs=Math.round((m-mins)*60); return `${mins}:${secs.toString().padStart(2,"0")}`; }
function formatTime(s: number): string { const h=Math.floor(s/3600); const m=Math.floor((s%3600)/60); const sec=s%60; if(h>0) return `${h}h ${m.toString().padStart(2,"0")}m`; return `${m}:${sec.toString().padStart(2,"0")}`; }
function formatDate(d: string): string { return new Date(d+"T00:00:00").toLocaleDateString("es-AR",{day:"numeric",month:"short",year:"numeric"}); }
function getIntensity(tss: number): {label:string;color:string} { if(tss<50) return {label:"Fácil",color:"text-ros-green"}; if(tss<100) return {label:"Moderado",color:"text-blue-400"}; if(tss<150) return {label:"Duro",color:"text-amber-400"}; return {label:"Muy duro",color:"text-red-400"}; }
function getStatusCopy(source: DataSource, reason: TrainingDataReason, message: string | null): { title: string; body: string; cta: string | null } {
  if (source === "not_connected") {
    if (reason === "token_invalid") {
      return {
        title: "Sin conexión",
        body: message ?? "El token de Strava es inválido o venció. Reconectá la cuenta para ver actividades reales.",
        cta: "Reconectar Strava →",
      };
    }
    return {
      title: "Sin conexión",
      body: message ?? "Strava no está conectada. Conectala para ver actividades reales.",
      cta: "Conectar Strava →",
    };
  }

  if (source === "fallback") {
    return {
      title: "Fallback activo",
      body: message ?? "No pudimos sincronizar actividades desde Strava en este momento.",
      cta: null,
    };
  }

  return {
    title: "Strava conectada",
    body: "Mostrando actividades sincronizadas en vivo.",
    cta: null,
  };
}

export default function ActivitiesClient({
  activities,
  source,
  reason,
  connectionStatus,
  message,
  title = "Actividades",
  kicker = "Running OS",
}: Props) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date"|"distance"|"tss"|"pace">("date");
  const [filterType, setFilterType] = useState<"all"|"Run"|"TrailRun">("all");
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;
  const statusCopy = getStatusCopy(source, reason, message);
  const stats = useMemo(() => {
    const runs = activities.filter(a=>a.type==="Run"||a.type==="TrailRun");
    return { count:runs.length, totalKm:runs.reduce((s,a)=>s+a.distance,0), totalTime:runs.reduce((s,a)=>s+a.moving_time,0), totalTSS:runs.reduce((s,a)=>s+a.tss,0), avgPace:runs.length?runs.reduce((s,a)=>s+a.average_pace,0)/runs.length:0 };
  }, [activities]);
  const filtered = useMemo(() => {
    let list=[...activities];
    if(filterType!=="all") list=list.filter(a=>a.type===filterType);
    if(search.trim()) { const q=search.toLowerCase(); list=list.filter(a=>a.name.toLowerCase().includes(q)||a.date.includes(q)); }
    list.sort((a,b)=>{ if(sortBy==="date") return b.date.localeCompare(a.date); if(sortBy==="distance") return b.distance-a.distance; if(sortBy==="tss") return b.tss-a.tss; if(sortBy==="pace") return a.average_pace-b.average_pace; return 0; });
    return list;
  }, [activities,search,sortBy,filterType]);
  const totalPages=Math.ceil(filtered.length/PER_PAGE);
  const paginated=filtered.slice((page-1)*PER_PAGE,page*PER_PAGE);
  const isReconnectState = source==="not_connected" || connectionStatus==="not_connected" || connectionStatus==="token_invalid";
  if(isReconnectState) return (
    <main className="ros-empty-state m-8">
      <div className="ros-module-title text-ros-amber">{statusCopy.title}</div>
      <div className="ros-body max-w-xl">{statusCopy.body}</div>
      <a href="/api/auth/strava" className="ros-button">{statusCopy.cta ?? "Conectar Strava"}</a>
    </main>
  );
  if(source==="fallback") return (
    <main className="ros-empty-state m-8">
      <div className="ros-module-title text-ros-amber">{statusCopy.title}</div>
      <div className="ros-body max-w-xl">{statusCopy.body}</div>
    </main>
  );
  return (
    <main className="flex flex-col h-full overflow-hidden bg-ros-bg">
      <header className="relative px-10 py-10 border-b border-white/[0.06] flex-shrink-0">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.05),transparent_32%)]" />
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="ros-kicker mb-2">{kicker}</div>
            <h1 className="font-sans text-[42px] font-semibold text-ros-bright tracking-[-0.07em]">{title}</h1>
          </div>
          <div className="font-mono text-[10px] text-ros-mid tracking-[0.18em] uppercase">{stats.count} carreras · {stats.totalKm.toFixed(0)} km totales</div>
        </div>
      </header>
      <div className="ros-panel-muted mx-10 mt-6 flex items-center justify-between px-6 py-5 flex-shrink-0">
        <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-ros-mid">
          {statusCopy.title}
        </div>
        <div className="font-sans text-sm text-ros-muted max-w-[60ch]">
          {statusCopy.body}
        </div>
      </div>
      <div className="mx-10 mt-6 grid grid-cols-4 gap-3 flex-shrink-0">
        {[{label:"Distancia total",value:`${stats.totalKm.toFixed(1)} km`},{label:"Tiempo total",value:formatTime(stats.totalTime)},{label:"TSS acumulado",value:Math.round(stats.totalTSS).toString()},{label:"Ritmo promedio",value:`${formatPace(stats.avgPace)} /km`}].map((s,i)=>(
          <div key={i} className="ros-panel px-6 py-5"><div className="font-mono text-[8px] text-ros-faint tracking-[0.22em] uppercase mb-2">{s.label}</div><div className="font-sans text-[30px] font-semibold text-ros-bright tracking-[-0.06em]">{s.value}</div></div>
        ))}
      </div>
      <div className="mx-10 mt-6 flex items-center gap-4 flex-shrink-0">
        <input type="text" placeholder="Buscar..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} className="ros-input w-56"/>
        <div className="flex gap-px">{(["all","Run","TrailRun"] as const).map(t=>(<button key={t} onClick={()=>{setFilterType(t);setPage(1);}} className={`font-mono text-[9px] px-3 py-1.5 tracking-[0.1em] uppercase transition-colors border ${filterType===t?"border-white/[0.08] bg-white/[0.06] text-ros-bright":"border-transparent bg-white/[0.02] text-ros-muted hover:border-white/[0.05] hover:text-ros-bright"}`}>{t==="all"?"Todas":t==="Run"?"Asfalto":"Trail"}</button>))}</div>
        <div className="flex items-center gap-2 ml-auto"><span className="font-mono text-[9px] text-ros-faint tracking-[0.15em] uppercase">Ordenar:</span>{(["date","distance","tss","pace"] as const).map(s=>(<button key={s} onClick={()=>{setSortBy(s);setPage(1);}} className={`font-mono text-[9px] px-2.5 py-1 tracking-[0.08em] uppercase transition-colors border ${sortBy===s?"border-ros-bright text-ros-bright":"border-transparent text-ros-faint hover:text-ros-muted"}`}>{s==="date"?"Fecha":s==="distance"?"Dist":s==="tss"?"TSS":"Ritmo"}</button>))}</div>
      </div>
      <div className="flex-1 overflow-y-auto px-10 py-6">
        <div className="ros-panel overflow-hidden">
        <div className="grid px-6 py-4 border-b border-white/[0.06]" style={{gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr 80px"}}>
          {["Actividad","Distancia","Tiempo","Ritmo","FC","TSS",""].map((h,i)=>(<div key={i} className="font-mono text-[8px] text-ros-faint tracking-[0.22em] uppercase">{h}</div>))}
        </div>
        {paginated.length===0?(<div className="flex flex-col items-center justify-center h-52 gap-2"><div className="font-mono text-[10px] text-ros-faint tracking-[0.22em] uppercase">Sin actividades</div><div className="font-sans text-ros-muted text-sm">No encontramos actividades en la ventana actual.</div></div>):paginated.map(a=>{const intensity=getIntensity(a.tss); return (
          <div key={a.id} className="grid px-6 py-5 border-b border-white/[0.06] hover:bg-white/[0.025] transition-colors" style={{gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr 80px"}}>
            <div className="min-w-0 pr-4"><div className="font-sans text-[13px] text-ros-bright truncate">{a.name}</div><div className="font-mono text-[10px] text-ros-faint">{formatDate(a.date)}{a.total_elevation_gain>10&&<span className="ml-2 text-ros-mid">↑{Math.round(a.total_elevation_gain)}m</span>}</div></div>
            <div className="flex items-center"><span className="font-sans text-[15px] font-medium text-ros-bright">{a.distance.toFixed(2)}</span><span className="font-mono text-[9px] text-ros-faint ml-1">km</span></div>
            <div className="flex items-center font-mono text-[13px] text-ros-muted">{formatTime(a.moving_time)}</div>
            <div className="flex items-center"><span className="font-mono text-[13px] text-ros-muted">{formatPace(a.average_pace)}</span><span className="font-mono text-[9px] text-ros-faint ml-1">/km</span></div>
            <div className="flex items-center font-mono text-[13px] text-ros-muted">{a.average_heartrate?<>{Math.round(a.average_heartrate)}<span className="text-[9px] text-ros-faint ml-1">bpm</span></>:<span className="text-ros-faint">—</span>}</div>
            <div className="flex items-center gap-2"><span className="font-mono text-[13px] text-ros-muted">{Math.round(a.tss)}</span><span className={`font-mono text-[9px] ${intensity.color}`}>{intensity.label}</span></div>
            <div className="flex items-center"><div className="w-full h-1 bg-ros-faint rounded-full overflow-hidden"><div className="h-full bg-ros-bright rounded-full" style={{width:`${Math.min(100,(a.tss/200)*100)}%`}}/></div></div>
          </div>);})}
        </div>
      </div>
      {totalPages>1&&(<div className="flex items-center justify-between px-10 py-3 border-t border-ros-border flex-shrink-0">
        <span className="font-mono text-[9px] text-ros-faint tracking-[0.18em] uppercase">{filtered.length} actividades · Página {page} de {totalPages}</span>
        <div className="flex gap-1">
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="ros-button disabled:opacity-30">Prev</button>
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="ros-button disabled:opacity-30">Next</button>
        </div>
      </div>)}
    </main>
  );
}
