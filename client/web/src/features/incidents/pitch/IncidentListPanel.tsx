import { useMemo, useState } from "react";
import { Bell, Filter, Inbox, Search } from "lucide-react";
import type { AgencyIncident, AgencyStatus, Priority } from "./types";
import { IncidentCard } from "./IncidentCard";
import { STATUS_LABEL } from "./mockData";

interface Props {
  incidents: AgencyIncident[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const STATUS_ORDER: (AgencyStatus | "all")[] = [
  "all",
  "new",
  "triaged",
  "in_progress",
  "resolved",
];
const STATUS_TAB_LABEL: Record<AgencyStatus | "all", string> = {
  all: "Sve",
  ...STATUS_LABEL,
};

const PRIORITY_FILTERS: { id: Priority | "all"; label: string }[] = [
  { id: "all", label: "Svi prioriteti" },
  { id: "urgent", label: "Hitno" },
  { id: "high", label: "Visok" },
  { id: "normal", label: "Normalan" },
  { id: "low", label: "Nizak" },
];

export function IncidentListPanel({ incidents, selectedId, onSelect }: Props) {
  const [statusTab, setStatusTab] = useState<AgencyStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: incidents.length };
    incidents.forEach((i) => {
      c[i.status] = (c[i.status] || 0) + 1;
    });
    return c;
  }, [incidents]);

  const filtered = useMemo(() => {
    return incidents.filter((i) => {
      if (statusTab !== "all" && i.status !== statusTab) return false;
      if (priorityFilter !== "all" && i.priority !== priorityFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!i.address.toLowerCase().includes(q) && !i.note.toLowerCase().includes(q))
          return false;
      }
      return true;
    });
  }, [incidents, statusTab, priorityFilter, query]);

  return (
    <aside
      className="flex flex-col h-full w-full lg:w-[440px] shrink-0 border-r border-ink-100 bg-ink-50"
      style={{ fontFamily: "Inter Tight, system-ui, sans-serif" }}
    >
      <div className="px-5 pt-5 pb-3 bg-white border-b border-ink-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-xl bg-brand-500 text-white grid place-items-center shadow-fab">
              <Inbox size={18} />
            </span>
            <div>
              <div className="text-[11px] font-bold tracking-[0.14em] text-brand-500">
                CENTRALA · UPRAVA
              </div>
              <div className="text-[16px] font-bold text-ink-900 leading-tight">
                Prijave građana
              </div>
            </div>
          </div>
          <button
            className="relative h-9 w-9 rounded-full grid place-items-center bg-ink-50 hover:bg-ink-100 text-ink-600"
            aria-label="Obaveštenja"
          >
            <Bell size={16} />
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-signal-red text-white text-[9px] font-bold grid place-items-center ring-2 ring-white">
              4
            </span>
          </button>
        </div>

        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pretraži po adresi ili napomeni…"
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-ink-50 ring-1 ring-ink-100 text-[13px] text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:bg-white"
          />
        </div>
      </div>

      <div className="px-5 pt-3 pb-2 bg-white border-b border-ink-100">
        <div className="flex gap-1.5 overflow-x-auto -mx-1 px-1 pb-1 nice-scroll">
          {STATUS_ORDER.map((s) => {
            const active = s === statusTab;
            const count = counts[s] || 0;
            return (
              <button
                key={s}
                onClick={() => setStatusTab(s)}
                className={`shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-semibold transition
                  ${
                    active
                      ? "bg-ink-900 text-white"
                      : "bg-ink-50 text-ink-600 hover:bg-ink-100"
                  }`}
              >
                {STATUS_TAB_LABEL[s]}
                <span
                  className={`text-[10.5px] px-1.5 rounded-full ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-white text-ink-500 ring-1 ring-ink-100"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 mt-2">
          <Filter size={12} className="text-ink-400" />
          <div className="flex gap-1.5 overflow-x-auto -mx-1 px-1 pb-1 nice-scroll">
            {PRIORITY_FILTERS.map((p) => {
              const active = p.id === priorityFilter;
              return (
                <button
                  key={p.id}
                  onClick={() => setPriorityFilter(p.id)}
                  className={`shrink-0 h-7 px-2.5 rounded-full text-[11px] font-semibold transition
                    ${
                      active
                        ? "bg-brand-500/10 text-brand-500 ring-1 ring-brand-500/30"
                        : "bg-ink-50 text-ink-500 ring-1 ring-ink-100 hover:bg-ink-100"
                    }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto nice-scroll p-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center text-ink-400 text-[13px] py-12">
            Nema prijava za ovaj filter.
          </div>
        ) : (
          filtered.map((i) => (
            <IncidentCard
              key={i.id}
              incident={i}
              selected={selectedId === i.id}
              onClick={() => onSelect(i.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
