import { useMemo, useState } from "react";
import {
  ArrowDownAZ,
  ClipboardList,
  Coins,
  Filter,
  Plus,
  Search,
  Timer,
  TrendingUp,
} from "lucide-react";
import { WORK_ORDERS, STATUS_LABEL } from "./mockData";
import type { WorkOrder, WorkOrderStatus } from "./types";
import { WorkOrderCard } from "./WorkOrderCard";

const COLUMNS: { id: WorkOrderStatus; tone: string; bar: string }[] = [
  { id: "created", tone: "text-ink-500", bar: "bg-ink-300" },
  { id: "in_progress", tone: "text-[#0F7AB3]", bar: "bg-signal-ice" },
  { id: "completed", tone: "text-signal-green", bar: "bg-signal-green" },
];

export function WorkOrdersBoardPage() {
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const out: Record<WorkOrderStatus, WorkOrder[]> = {
      created: [],
      in_progress: [],
      completed: [],
      blocked: [],
    };
    WORK_ORDERS.filter((o) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        o.title.toLowerCase().includes(q) ||
        o.address.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
      );
    }).forEach((o) => out[o.status].push(o));
    return out;
  }, [query]);

  const totals = useMemo(() => {
    const all = WORK_ORDERS;
    const inProgress = all.filter((o) => o.status === "in_progress").length;
    const todayDone = all.filter(
      (o) => o.status === "completed" && o.completedAt?.startsWith("juče") === false
    ).length;
    const avgDuration =
      all
        .filter((o) => o.durationHours)
        .reduce((s, o) => s + (o.durationHours || 0), 0) /
        Math.max(1, all.filter((o) => o.durationHours).length);
    const cost = all.reduce((s, o) => s + (o.cost || 0), 0);
    return { inProgress, todayDone, avgDuration, cost };
  }, []);

  return (
    <div
      className="citizen-root fixed inset-0 h-[100dvh] w-full overflow-hidden bg-ink-50 flex flex-col"
      style={{ fontFamily: "Inter Tight, system-ui, sans-serif" }}
    >
      <header className="shrink-0 bg-white border-b border-ink-100 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-xl bg-ink-900 text-white grid place-items-center">
              <ClipboardList size={18} />
            </span>
            <div>
              <div className="text-[11px] font-bold tracking-[0.14em] text-brand-500 uppercase">
                Operativa · Radni nalozi
              </div>
              <div className="text-[16px] font-bold text-ink-900 leading-tight">
                Tabla naloga · danas
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-md ml-4 relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pretraži po nalogu, naslovu ili adresi…"
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-ink-50 ring-1 ring-ink-100 text-[13px] text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 text-[12px]">
            <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-ink-50 ring-1 ring-ink-100 text-ink-600 hover:bg-ink-100">
              <Filter size={13} /> Filteri
            </button>
            <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-ink-50 ring-1 ring-ink-100 text-ink-600 hover:bg-ink-100">
              <ArrowDownAZ size={13} /> Sortiraj
            </button>
            <button className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-brand-500 text-white font-semibold shadow-fab hover:bg-brand-600">
              <Plus size={14} /> Novi nalog
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mt-4">
          <Kpi icon={<Timer size={14} />} label="U toku sada" value={`${totals.inProgress}`} accent="text-[#0F7AB3]" />
          <Kpi icon={<TrendingUp size={14} />} label="Završeno danas" value={`${totals.todayDone}`} accent="text-signal-green" />
          <Kpi icon={<Timer size={14} />} label="Prosečno trajanje" value={`${totals.avgDuration.toFixed(1)} h`} accent="text-ink-700" />
          <Kpi icon={<Coins size={14} />} label="Trošak ovog ciklusa" value={`${totals.cost.toLocaleString("sr-RS")} €`} accent="text-brand-500" />
        </div>
      </header>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-5">
        <div className="grid grid-cols-3 gap-5 h-full min-w-[1000px]">
          {COLUMNS.map((col) => {
            const items = grouped[col.id];
            return (
              <div
                key={col.id}
                className="flex flex-col rounded-2xl bg-white ring-1 ring-ink-100 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${col.bar}`} />
                    <div className={`text-[12px] font-bold tracking-wide uppercase ${col.tone}`}>
                      {STATUS_LABEL[col.id]}
                    </div>
                    <span className="text-[10.5px] font-bold text-ink-400 bg-ink-50 ring-1 ring-ink-100 rounded-full px-2 py-0.5">
                      {items.length}
                    </span>
                  </div>
                  <button className="text-[11px] text-ink-400 hover:text-ink-700">
                    + Dodaj
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto nice-scroll p-3 space-y-3">
                  {items.length === 0 ? (
                    <div className="text-center text-ink-300 text-[12px] py-8">
                      Nema naloga.
                    </div>
                  ) : (
                    items.map((o) => <WorkOrderCard key={o.id} order={o} />)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl bg-ink-50 ring-1 ring-ink-100 px-3.5 py-2.5">
      <div className={`text-[10.5px] font-bold tracking-[0.14em] uppercase inline-flex items-center gap-1 ${accent}`}>
        {icon} {label}
      </div>
      <div className="text-[18px] font-bold text-ink-900 leading-tight mt-0.5">
        {value}
      </div>
    </div>
  );
}
