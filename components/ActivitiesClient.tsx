"use client";
import { useState, useMemo } from "react";
import type { Activity } from "@/lib/strava";
interface Props { activities: Activity[]; error: string | null; }
function formatPace(m: number): string { if (!m||m<=0) return "—"; const mins=Math.floor(m); const secs=Math.round((m-mins)*60); return `${mins}:${secs.toString().padStart(2,"0")}`; }
function formatTime(s: number): string { const h=Math.floor(s/3600); const m=Math.floor((s%3600)/60); const sec=s%60; if(h>0) return `${h}h ${m.toString().padStart(2,"0")}m`; return `${m}:${sec.toString().padStart(2,"0")}`; }
function formatDate(d: string): string { return new Date(d+"T00:00:00").toLocaleDateString("es-AR",{day:"numeric",month:"short",year:"numeric"}); }
function getIntensity(tss: number): {label:string;color:string} { if(tss<50) return {label:"Fácil",color:"text-ros-green"}; if(tss<100) return {label:"Moderado",color:"text-blue-400"}; if(tss<150) return {label:"Duro",color:"text-amber-400"}; return {label:"Muy duro",color:"text-red-400"}; }
export default function ActivitiesClient({ activities, error }: Props) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date"|"distance"|"tss"|"pace">("date");
  const [filterType, setFilterType] = useState<"all"|"Run"|"TrailRun">("all");
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;
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
  if(error==="NOT_CONNECTED") return (<main className="flex flex-col items-center justify-center h-full gap-4"><div className="font-mono text-[11px] text-ros-faint tracking-[0.2em] uppercase">Sin conexión</div><a href="/connect" className="font-mono text-[11px] px-5 py-2.5 border border-ros-border2 text-ros-muted hover:text-ros-bright transition-colors tracking-[0.1em] uppercase">Conectar Strava →</a></main>);
  if(error) return (<main className="flex flex-col items-center justify-center h-full gap-3"><div className="font-mono text-[11px] text-red-400">ERROR</div><div className="font-sans text-ros-muted text-sm">{error}</div></main>);
  return (
    <main className="flex flex-col h-full overflow-hidden bg-ros-bg">
      <header className="flex items-center justify-between px-8 py-5 border-b border-ros-border flex-shrink-0">
        <div><div className="font-mono text-[10px] text-ros-faint tracking-[0.2em] uppercase mb-1">Running OS</div><h1 className="font-sans text-[22px] font-semibold text-ros-bright tracking-tight">Actividades</h1></div>
        <div className="font-mono text-[10px] text-ros-mid tracking-[0.1em]">{stats.count} carreras · {stats.totalKm.toFixed(0)} km totales</div>
      </header>
      <div className="grid grid-cols-4 border-b border-ros-border flex-shrink-0">
        {[{label:"Distancia total",value:`${stats.totalKm.toFixed(1)} km`},{label:"Tiempo total",value:formatTime(stats.totalTime)},{label:"TSS acumulado",value:Math.round(stats.totalTSS).toString()},{label:"Ritmo promedio",value:`${formatPace(stats.avgPace)} /km`}].map((s,i)=>(
          <div key={i} className="px-8 py-4 border-r border-ros-border last:border-r-0"><div className="font-mono text-[9px] text-ros-faint tracking-[0.18em] uppercase mb-1">{s.label}</div><div className="font-sans text-[20px] font-semibold text-ros-bright">{s.value}</div></div>
        ))}
      </div>
      <div className="flex items-center gap-4 px-8 py-3 border-b border-ros-border flex-shrink-0">
        <input type="text" placeholder="Buscar..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} className="bg-ros-faint border border-ros-border2 rounded-sm px-3 py-1.5 font-mono text-[11px] text-ros-bright placeholder-ros-faint w-48 focus:outline-none focus:border-ros-muted"/>
        <div className="flex gap-px">{(["all","Run","TrailRun"] as const).map(t=>(<button key={t} onClick={()=>{setFilterType(t);setPage(1);}} className={`font-mono text-[9px] px-3 py-1.5 tracking-[0.1em] uppercase transition-colors ${filterType===t?"bg-ros-bright text-ros-bg":"bg-ros-faint text-ros-muted hover:text-ros-bright"}`}>{t==="all"?"Todas":t==="Run"?"Asfalto":"Trail"}</button>))}</div>
        <div className="flex items-center gap-2 ml-auto"><span className="font-mono text-[9px] text-ros-faint tracking-[0.15em] uppercase">Ordenar:</span>{(["date","distance","tss","pace"] as const).map(s=>(<button key={s} onClick={()=>{setSortBy(s);setPage(1);}} className={`font-mono text-[9px] px-2.5 py-1 tracking-[0.08em] uppercase transition-colors border ${sortBy===s?"border-ros-bright text-ros-bright":"border-transparent text-ros-faint hover:text-ros-muted"}`}>{s==="date"?"Fecha":s==="distance"?"Dist":s==="tss"?"TSS":"Ritmo"}</button>))}</div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="grid px-8 py-2 border-b border-ros-border" style={{gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr 80px"}}>
          {["Actividad","Distancia","Tiempo","Ritmo","FC","TSS",""].map((h,i)=>(<div key={i} className="font-mono text-[9px] text-ros-faint tracking-[0.18em] uppercase">{h}</div>))}
        </div>
        {paginated.length===0?(<div className="flex items-center justify-center h-40 font-mono text-[11px] text-ros-faint">SIN RESULTADOS</div>):paginated.map(a=>{const intensity=getIntensity(a.tss); return (
          <div key={a.id} className="grid px-8 py-4 border-b border-ros-border hover:bg-white/[0.02] transition-colors" style={{gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr 80px"}}>
            <div className="min-w-0 pr-4"><div className="font-sans text-[13px] text-ros-bright truncate">{a.name}</div><div className="font-mono text-[10px] text-ros-faint">{formatDate(a.date)}{a.total_elevation_gain>10&&<span className="ml-2 text-ros-mid">↑{Math.round(a.total_elevation_gain)}m</span>}</div></div>
            <div className="flex items-center"><span className="font-sans text-[15px] font-medium text-ros-bright">{a.distance.toFixed(2)}</span><span className="font-mono text-[9px] text-ros-faint ml-1">km</span></div>
            <div className="flex items-center font-mono text-[13px] text-ros-muted">{formatTime(a.moving_time)}</div>
            <div className="flex items-center"><span className="font-mono text-[13px] text-ros-muted">{formatPace(a.average_pace)}</span><span className="font-mono text-[9px] text-ros-faint ml-1">/km</span></div>
            <div className="flex items-center font-mono text-[13px] text-ros-muted">{a.average_heartrate?<>{Math.round(a.average_heartrate)}<span className="text-[9px] text-ros-faint ml-1">bpm</span></>:<span className="text-ros-faint">—</span>}</div>
            <div className="flex items-center gap-2"><span className="font-mono text-[13px] text-ros-muted">{Math.round(a.tss)}</span><span className={`font-mono text-[9px] ${intensity.color}`}>{intensity.label}</span></div>
            <div className="flex items-center"><div className="w-full h-1 bg-ros-faint rounded-full overflow-hidden"><div className="h-full bg-ros-bright rounded-full" style={{width:`${Math.min(100,(a.tss/200)*100)}%`}}/></div></div>
          </div>);})}
      </div>
      {totalPages>1&&(<div className="flex items-center justify-between px-8 py-3 border-t border-ros-border flex-shrink-0">
        <span className="font-mono text-[10px] text-ros-faint">{filtered.length} actividades · Página {page} de {totalPages}</span>
        <div className="flex gap-1">
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="font-mono text-[10px] px-3 py-1.5 border border-ros-border2 text-ros-muted hover:text-ros-bright disabled:opacity-30 transition-colors">← PREV</button>
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="font-mono text-[10px] px-3 py-1.5 border border-ros-border2 text-ros-muted hover:text-ros-bright disabled:opacity-30 transition-colors">NEXT →</button>
        </div>
      </div>)}
    </main>
  );
}
