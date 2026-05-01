import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  Coins,
  DoorClosed,
  DoorOpen,
  FileSearch,
  History,
  Info,
  Map as MapIcon,
  Route,
  Search,
  Wrench,
  X,
} from "lucide-react";
import {
  CLASS_LABEL,
  CONDITION_COLOR,
  CONDITION_LABEL,
  ROAD_SEGMENTS,
  STATUS_LABEL,
  STATUS_TONE,
} from "./mockData";
import type { HistoryEntry, RoadSegment } from "./types";

export function RoadSegmentsPage() {
  const [selected, setSelected] = useState<RoadSegment | null>(ROAD_SEGMENTS[0]);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return ROAD_SEGMENTS;
    const q = query.toLowerCase();
    return ROAD_SEGMENTS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.fromTo.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div
      className="citizen-root min-h-[100dvh] w-full bg-ink-50 flex flex-col"
      style={{ fontFamily: "Inter Tight, system-ui, sans-serif" }}
    >
      <header className="shrink-0 bg-white border-b border-ink-100 px-8 py-4 flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <span className="h-9 w-9 rounded-xl bg-ink-900 text-white grid place-items-center">
            <Route size={18} />
          </span>
          <div>
            <div className="text-[11px] font-bold tracking-[0.14em] text-brand-500 uppercase">
              Mreža puteva · Katalog deonica
            </div>
            <div className="text-[16px] font-bold text-ink-900 leading-tight">
              {ROAD_SEGMENTS.length} deonica · region Novi Pazar
            </div>
          </div>
        </div>
        <div className="flex-1 max-w-md ml-4 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pretraži po nazivu, šifri ili relaciji…"
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-ink-50 ring-1 ring-ink-100 text-[13px] text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:bg-white"
          />
        </div>
        <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-ink-50 ring-1 ring-ink-100 text-ink-600 hover:bg-ink-100 text-[12px] font-semibold">
          <FileSearch size={13} /> Izveštaj o stanju mreže
        </button>
      </header>

      <main className="flex-1 px-8 py-6 grid grid-cols-12 gap-5 max-w-[1600px] w-full mx-auto">
        <section className="col-span-7 space-y-3">
          {filtered.map((s) => (
            <SegmentRow
              key={s.id}
              segment={s}
              active={selected?.id === s.id}
              onClick={() => setSelected(s)}
            />
          ))}
        </section>

        <aside className="col-span-5">
          {selected ? (
            <SegmentDetail
              key={selected.id}
              segment={selected}
              onClose={() => setSelected(null)}
            />
          ) : (
            <div className="rounded-2xl bg-white ring-1 ring-ink-100 p-8 text-center text-ink-400">
              <MapIcon size={28} className="mx-auto mb-2" />
              <div className="text-[13px]">Izaberite deonicu sa leve strane.</div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}

function SegmentRow({
  segment,
  active,
  onClick,
}: {
  segment: RoadSegment;
  active?: boolean;
  onClick: () => void;
}) {
  const condColor = CONDITION_COLOR[segment.condition];
  return (
    <button
      onClick={onClick}
      className={`group w-full text-left rounded-2xl bg-white ring-1 transition-all p-4
        ${
          active
            ? "ring-brand-500 shadow-lift"
            : "ring-ink-100 hover:ring-ink-200 hover:shadow-soft"
        }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
          <span
            className="h-12 w-12 rounded-2xl grid place-items-center text-white shadow-soft"
            style={{ background: condColor }}
          >
            <span className="text-[15px] font-bold">{segment.conditionScore}</span>
          </span>
          <span
            className="text-[9.5px] font-bold tracking-wide uppercase"
            style={{ color: condColor }}
          >
            {CONDITION_LABEL[segment.condition]}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-ink-400 font-mono">
              {segment.code}
            </span>
            <span className="text-[10.5px] font-bold uppercase tracking-wide text-ink-700 bg-ink-50 ring-1 ring-ink-100 rounded-full px-2 py-0.5">
              {CLASS_LABEL[segment.klass]}
            </span>
            <span
              className={`text-[10.5px] font-bold tracking-wide uppercase rounded-full px-2 py-0.5 ${
                STATUS_TONE[segment.status]
              }`}
            >
              {STATUS_LABEL[segment.status]}
            </span>
          </div>
          <div className="text-[15.5px] font-bold text-ink-900 leading-tight mt-1">
            {segment.name}
          </div>
          <div className="text-[12px] text-ink-500 mt-0.5">
            {segment.fromTo} · {segment.lengthKm.toFixed(2)} km
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <SmallStat
              icon={<AlertTriangle size={11} />}
              label="Otvorene"
              value={`${segment.openIncidents}`}
              tone={segment.openIncidents > 0 ? "text-signal-red" : "text-ink-700"}
            />
            <SmallStat
              icon={<History size={11} />}
              label="12 mes."
              value={`${segment.totalIncidents12mo}`}
              tone="text-ink-700"
            />
            <SmallStat
              icon={<Coins size={11} />}
              label="Trošak 12 mes."
              value={`${segment.totalCost12mo.toLocaleString("sr-RS")} €`}
              tone="text-ink-700"
            />
          </div>

          <div className="mt-3 flex items-center gap-2 text-[10.5px] text-ink-400">
            <span className="inline-flex items-center gap-1">
              <ClipboardCheck size={11} /> Pregled: {segment.lastInspection}
            </span>
            <span className="text-ink-200">·</span>
            <span className="inline-flex items-center gap-1">
              <Info size={11} /> Sledeći: {segment.nextInspection}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function SmallStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-xl bg-ink-50 ring-1 ring-ink-100 px-2.5 py-1.5">
      <div className="text-[9.5px] font-bold tracking-wide text-ink-400 uppercase inline-flex items-center gap-1">
        {icon} {label}
      </div>
      <div className={`text-[13px] font-bold leading-tight mt-0.5 ${tone}`}>
        {value}
      </div>
    </div>
  );
}

function SegmentDetail({
  segment,
  onClose,
}: {
  segment: RoadSegment;
  onClose: () => void;
}) {
  const condColor = CONDITION_COLOR[segment.condition];

  return (
    <div className="rounded-2xl bg-white ring-1 ring-ink-100 overflow-hidden sticky top-6">
      <div className="px-5 py-4 border-b border-ink-100 flex items-start gap-3">
        <span
          className="h-12 w-12 rounded-2xl grid place-items-center text-white shrink-0"
          style={{ background: condColor }}
        >
          <Route size={20} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-brand-500">
            {CLASS_LABEL[segment.klass]} · {segment.code}
          </div>
          <div className="text-[19px] font-bold text-ink-900 leading-tight">
            {segment.name}
          </div>
          <div className="text-[12px] text-ink-500 mt-0.5">
            {segment.fromTo} · {segment.lengthKm.toFixed(2)} km
          </div>
        </div>
        <button
          onClick={onClose}
          className="h-9 w-9 rounded-full grid place-items-center bg-ink-50 hover:bg-ink-100 text-ink-500"
        >
          <X size={16} />
        </button>
      </div>

      <div className="px-5 py-4 grid grid-cols-2 gap-3 border-b border-ink-100">
        <div>
          <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-ink-400">
            Stanje kolovoza
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span
              className="text-[28px] font-bold leading-none"
              style={{ color: condColor }}
            >
              {segment.conditionScore}
            </span>
            <span className="text-[12px] text-ink-400 font-semibold">/ 100</span>
          </div>
          <div
            className="h-2 rounded-full bg-ink-100 mt-2 overflow-hidden"
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${segment.conditionScore}%`,
                background: condColor,
              }}
            />
          </div>
          <div className="text-[10.5px] font-semibold mt-1" style={{ color: condColor }}>
            {CONDITION_LABEL[segment.condition]}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-ink-400">
            Status saobraćaja
          </div>
          <div
            className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold ${
              STATUS_TONE[segment.status]
            }`}
          >
            {STATUS_LABEL[segment.status]}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="rounded-lg bg-ink-50 ring-1 ring-ink-100 px-2 py-1.5">
              <div className="text-[9.5px] font-bold tracking-wide text-ink-400 uppercase">
                Otvorene
              </div>
              <div
                className={`text-[14px] font-bold ${
                  segment.openIncidents > 0
                    ? "text-signal-red"
                    : "text-ink-700"
                }`}
              >
                {segment.openIncidents}
              </div>
            </div>
            <div className="rounded-lg bg-ink-50 ring-1 ring-ink-100 px-2 py-1.5">
              <div className="text-[9.5px] font-bold tracking-wide text-ink-400 uppercase">
                12 mes.
              </div>
              <div className="text-[14px] font-bold text-ink-700">
                {segment.totalIncidents12mo}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-7 w-7 rounded-lg bg-ink-50 ring-1 ring-ink-100 text-ink-600 grid place-items-center">
            <History size={14} />
          </span>
          <div className="text-[13px] font-bold text-ink-900">
            Istorija prijava i radova
          </div>
        </div>

        <div className="relative pl-5">
          <div className="absolute left-[7px] top-1 bottom-1 w-px bg-ink-100" />
          <div className="space-y-3">
            {segment.history.map((entry) => (
              <TimelineItem key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ entry }: { entry: HistoryEntry }) {
  const cfg: Record<
    HistoryEntry["kind"],
    { icon: React.ComponentType<{ size?: number }>; tone: string }
  > = {
    incident: { icon: AlertTriangle, tone: "bg-brand-500/10 text-brand-500 ring-brand-500/30" },
    work_completed: { icon: CheckCircle2, tone: "bg-signal-green/15 text-signal-green ring-signal-green/30" },
    inspection: { icon: ClipboardCheck, tone: "bg-signal-ice/15 text-[#0F7AB3] ring-signal-ice/40" },
    audit: { icon: FileSearch, tone: "bg-ink-100 text-ink-700 ring-ink-200" },
    closure: { icon: DoorClosed, tone: "bg-signal-red/10 text-signal-red ring-signal-red/30" },
    open: { icon: DoorOpen, tone: "bg-signal-green/10 text-signal-green ring-signal-green/30" },
  };
  const { icon: Icon, tone } = cfg[entry.kind];

  return (
    <div className="relative">
      <span
        className={`absolute -left-5 top-0 h-4 w-4 rounded-full grid place-items-center ring-1 ${tone}`}
        style={{ marginLeft: "-1px" }}
      >
        <Icon size={9} />
      </span>
      <div className="rounded-xl bg-ink-50 ring-1 ring-ink-100 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="text-[10.5px] font-bold tracking-wide uppercase text-ink-400">
            {entry.date}
          </div>
          {entry.attachments ? (
            <span className="text-[10.5px] font-semibold text-ink-500 inline-flex items-center gap-1">
              <Briefcase size={10} /> {entry.attachments}
            </span>
          ) : null}
        </div>
        <div className="text-[13.5px] font-bold text-ink-900 leading-tight mt-0.5">
          {entry.title}
        </div>
        {entry.details && (
          <div className="text-[11.5px] text-ink-500 mt-1">{entry.details}</div>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {entry.crew && (
            <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-ink-700 bg-white ring-1 ring-ink-100 rounded-full px-2 py-0.5">
              <Wrench size={10} /> {entry.crew}
            </span>
          )}
          {entry.cost ? (
            <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-brand-500 bg-brand-500/10 rounded-full px-2 py-0.5">
              <Coins size={10} /> {entry.cost.toLocaleString("sr-RS")} €
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
