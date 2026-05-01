import { useState } from "react";
import {
  Boxes,
  Database,
  Plus,
  Search,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";
import { VehiclesTab } from "./VehiclesTab";
import { WorkersTab } from "./WorkersTab";
import { EquipmentTab } from "./EquipmentTab";
import { ASSET_VEHICLES, EQUIPMENT, WORKERS } from "./mockData";

type TabId = "vehicles" | "workers" | "equipment";

export function ResourcesPage() {
  const [tab, setTab] = useState<TabId>("vehicles");
  const [query, setQuery] = useState("");

  return (
    <div
      className="citizen-root min-h-[100dvh] w-full bg-ink-50 flex flex-col"
      style={{ fontFamily: "Inter Tight, system-ui, sans-serif" }}
    >
      <header className="shrink-0 bg-white border-b border-ink-100 px-8 py-4 flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <span className="h-9 w-9 rounded-xl bg-ink-900 text-white grid place-items-center">
            <Database size={18} />
          </span>
          <div>
            <div className="text-[11px] font-bold tracking-[0.14em] text-brand-500 uppercase">
              Operativa · Resursi
            </div>
            <div className="text-[16px] font-bold text-ink-900 leading-tight">
              Vozila, radnici i oprema
            </div>
          </div>
        </div>

        <div className="ml-6 flex items-center gap-1">
          <TabBtn active={tab === "vehicles"} onClick={() => setTab("vehicles")} icon={<Truck size={14} />}>
            Vozila <Pill>{ASSET_VEHICLES.length}</Pill>
          </TabBtn>
          <TabBtn active={tab === "workers"} onClick={() => setTab("workers")} icon={<Users size={14} />}>
            Radnici <Pill>{WORKERS.length}</Pill>
          </TabBtn>
          <TabBtn
            active={tab === "equipment"}
            onClick={() => setTab("equipment")}
            icon={<Warehouse size={14} />}
          >
            Oprema i materijali <Pill>{EQUIPMENT.length}</Pill>
          </TabBtn>
        </div>

        <div className="flex-1 max-w-md ml-auto relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              tab === "vehicles"
                ? "Pretraži po registraciji, pozivnom znaku, vozaču…"
                : tab === "workers"
                  ? "Pretraži po imenu, ulozi, ekipi…"
                  : "Pretraži po nazivu opreme ili kategoriji…"
            }
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-ink-50 ring-1 ring-ink-100 text-[13px] text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:bg-white"
          />
        </div>

        <button className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-brand-500 text-white text-[13px] font-bold shadow-fab hover:bg-brand-600">
          <Plus size={14} />
          {tab === "vehicles"
            ? "Novo vozilo"
            : tab === "workers"
              ? "Novi radnik"
              : "Nova stavka"}
        </button>
      </header>

      <main className="flex-1 px-8 py-6">
        {tab === "vehicles" && <VehiclesTab query={query} />}
        {tab === "workers" && <WorkersTab query={query} />}
        {tab === "equipment" && <EquipmentTab query={query} />}
      </main>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-[12.5px] font-semibold transition
        ${active ? "bg-ink-900 text-white" : "text-ink-600 hover:bg-ink-50"}`}
    >
      {icon}
      {children}
    </button>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-1 text-[10px] font-bold rounded-full px-1.5 py-0.5 bg-white/15 text-current">
      {children}
    </span>
  );
}

// Re-export so it lazy-imports cleanly
export { Boxes };
