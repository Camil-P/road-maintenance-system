import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Bookmark,
  CalendarClock,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Megaphone,
  Pencil,
  Pin,
  Plus,
  Send,
  Trash2,
  Users,
} from "lucide-react";
import {
  ADMIN_NEWS,
  AUDIENCE_LABEL,
  SEVERITY_COLOR,
  SEVERITY_LABEL,
  STATUS_LABEL,
} from "./mockData";
import type { AdminNewsItem, NewsSeverity, NewsStatus } from "./types";

const STATUS_TONE: Record<NewsStatus, string> = {
  published: "bg-signal-green/15 text-signal-green ring-1 ring-signal-green/30",
  draft: "bg-ink-100 text-ink-500 ring-1 ring-ink-200",
  scheduled: "bg-signal-ice/15 text-[#0F7AB3] ring-1 ring-signal-ice/40",
  archived: "bg-ink-50 text-ink-400 ring-1 ring-ink-100",
};

const SEVERITY_FILTERS: (NewsSeverity | "all")[] = [
  "all",
  "closure",
  "alert",
  "works",
  "info",
];
const SEVERITY_TAB_LABEL: Record<NewsSeverity | "all", string> = {
  all: "Sve",
  ...SEVERITY_LABEL,
};

export function NewsAdminPage() {
  const [filter, setFilter] = useState<NewsSeverity | "all">("all");
  const [selected, setSelected] = useState<AdminNewsItem | null>(ADMIN_NEWS[0]);
  const [composerOpen, setComposerOpen] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: ADMIN_NEWS.length };
    ADMIN_NEWS.forEach((n) => (c[n.severity] = (c[n.severity] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    return ADMIN_NEWS.filter((n) => filter === "all" || n.severity === filter);
  }, [filter]);

  const stats = useMemo(() => {
    const published = ADMIN_NEWS.filter((n) => n.status === "published");
    const totalViews = published.reduce((s, n) => s + n.views, 0);
    const totalReach = published.reduce((s, n) => s + n.reach, 0);
    const live = published.length;
    const scheduled = ADMIN_NEWS.filter((n) => n.status === "scheduled").length;
    return { totalViews, totalReach, live, scheduled };
  }, []);

  return (
    <div
      className="citizen-root min-h-[100dvh] w-full bg-ink-50 flex flex-col"
      style={{ fontFamily: "Inter Tight, system-ui, sans-serif" }}
    >
      <header className="shrink-0 bg-white border-b border-ink-100 px-8 py-4 flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <span className="h-9 w-9 rounded-xl bg-brand-500 text-white grid place-items-center shadow-fab">
            <Megaphone size={18} />
          </span>
          <div>
            <div className="text-[11px] font-bold tracking-[0.14em] text-brand-500 uppercase">
              Komunikacije · Vesti
            </div>
            <div className="text-[16px] font-bold text-ink-900 leading-tight">
              Obaveštenja za građane
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 flex-1 max-w-3xl ml-6">
          <MiniStat icon={<Eye size={12} />} label="Pregleda" value={stats.totalViews.toLocaleString("sr-RS")} />
          <MiniStat icon={<Users size={12} />} label="Doseg" value={stats.totalReach.toLocaleString("sr-RS")} />
          <MiniStat icon={<CheckCircle2 size={12} />} label="Aktivno" value={`${stats.live}`} accent="text-signal-green" />
          <MiniStat icon={<CalendarClock size={12} />} label="Zakazano" value={`${stats.scheduled}`} accent="text-[#0F7AB3]" />
        </div>

        <button
          onClick={() => setComposerOpen(true)}
          className="ml-auto inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-brand-500 text-white font-bold shadow-fab hover:bg-brand-600 transition"
        >
          <Plus size={15} /> Nova objava
        </button>
      </header>

      <main className="flex-1 px-8 py-6 grid grid-cols-12 gap-5 max-w-[1500px] w-full mx-auto">
        <section className="col-span-7">
          <div className="flex gap-1.5 mb-3 overflow-x-auto -mx-1 px-1 pb-1 nice-scroll">
            {SEVERITY_FILTERS.map((s) => {
              const active = s === filter;
              const c = counts[s] || 0;
              return (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`shrink-0 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-semibold transition
                    ${active ? "bg-ink-900 text-white" : "bg-white ring-1 ring-ink-100 text-ink-600 hover:ring-ink-200"}`}
                >
                  {s !== "all" && (
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: SEVERITY_COLOR[s as NewsSeverity] }}
                    />
                  )}
                  {SEVERITY_TAB_LABEL[s]}
                  <span
                    className={`text-[10.5px] px-1.5 rounded-full ${
                      active ? "bg-white/20 text-white" : "bg-ink-50 text-ink-500 ring-1 ring-ink-100"
                    }`}
                  >
                    {c}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-2.5">
            {filtered.map((n) => (
              <NewsRow
                key={n.id}
                item={n}
                active={selected?.id === n.id}
                onClick={() => setSelected(n)}
              />
            ))}
          </div>
        </section>

        <aside className="col-span-5">
          {composerOpen ? (
            <Composer onClose={() => setComposerOpen(false)} />
          ) : selected ? (
            <NewsDetail key={selected.id} item={selected} />
          ) : (
            <div className="rounded-2xl bg-white ring-1 ring-ink-100 p-8 text-center text-ink-400">
              <Megaphone size={28} className="mx-auto mb-2" />
              <div className="text-[13px]">Izaberite objavu sa leve strane.</div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl bg-ink-50 ring-1 ring-ink-100 px-3 py-2">
      <div className="text-[10px] font-bold tracking-wide uppercase text-ink-400 inline-flex items-center gap-1">
        {icon} {label}
      </div>
      <div className={`text-[14.5px] font-bold leading-tight ${accent || "text-ink-900"}`}>
        {value}
      </div>
    </div>
  );
}

function NewsRow({
  item,
  active,
  onClick,
}: {
  item: AdminNewsItem;
  active?: boolean;
  onClick: () => void;
}) {
  const sevColor = SEVERITY_COLOR[item.severity];

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
      <div className="flex items-start gap-3">
        <span
          className="h-10 w-10 rounded-2xl grid place-items-center text-white shrink-0"
          style={{ background: sevColor }}
        >
          {item.severity === "closure" ? (
            <AlertTriangle size={17} />
          ) : item.severity === "alert" ? (
            <AlertTriangle size={17} />
          ) : item.severity === "works" ? (
            <Bookmark size={17} />
          ) : (
            <Megaphone size={17} />
          )}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="text-[10.5px] font-bold tracking-wide uppercase rounded-full px-2 py-0.5"
              style={{ background: `${sevColor}1a`, color: sevColor }}
            >
              {SEVERITY_LABEL[item.severity]}
            </span>
            <span
              className={`text-[10.5px] font-bold tracking-wide uppercase rounded-full px-2 py-0.5 ${
                STATUS_TONE[item.status]
              }`}
            >
              {STATUS_LABEL[item.status]}
            </span>
            {item.pinned && (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-brand-500 bg-brand-500/10 rounded-full px-2 py-0.5">
                <Pin size={10} /> Pin
              </span>
            )}
            <span className="text-[10.5px] text-ink-400 font-semibold">
              · {AUDIENCE_LABEL[item.audience]}
            </span>
          </div>

          <div className="text-[14.5px] font-bold text-ink-900 mt-1.5 leading-tight">
            {item.headline}
          </div>
          <div className="text-[12px] text-ink-500 mt-1 line-clamp-2 leading-snug">
            {item.detail}
          </div>

          <div className="flex items-center gap-3 mt-2.5 text-[10.5px] text-ink-400">
            <span className="inline-flex items-center gap-1">
              <Clock size={11} />
              {item.publishedAt || item.scheduledFor || "Nacrt"}
            </span>
            {item.status === "published" && (
              <>
                <span className="text-ink-200">·</span>
                <span className="inline-flex items-center gap-1">
                  <Eye size={11} /> {item.views.toLocaleString("sr-RS")}
                </span>
                <span className="text-ink-200">·</span>
                <span className="inline-flex items-center gap-1">
                  <Users size={11} /> {item.reach.toLocaleString("sr-RS")}
                </span>
              </>
            )}
            <span className="ml-auto inline-flex items-center gap-1.5 font-semibold text-ink-500">
              <span className="h-4 w-4 rounded-full bg-ink-700 text-white grid place-items-center text-[8px] font-bold">
                {item.author.initials}
              </span>
              {item.author.name}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function NewsDetail({ item }: { item: AdminNewsItem }) {
  const sevColor = SEVERITY_COLOR[item.severity];
  return (
    <div className="rounded-2xl bg-white ring-1 ring-ink-100 overflow-hidden sticky top-6">
      <div
        className="px-5 py-4 text-white"
        style={{ background: `linear-gradient(135deg, ${sevColor}, ${sevColor}cc)` }}
      >
        <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase opacity-90">
          {SEVERITY_LABEL[item.severity]} · {item.region}
        </div>
        <div className="text-[20px] font-bold leading-tight mt-0.5">
          {item.headline}
        </div>
        <div className="text-[12.5px] opacity-90 mt-1.5 leading-relaxed">
          {item.detail}
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <DetailLabel label="Status">
            <span
              className={`inline-flex items-center gap-1 text-[11.5px] font-bold rounded-full px-2.5 py-1 ${
                STATUS_TONE[item.status]
              }`}
            >
              {STATUS_LABEL[item.status]}
            </span>
          </DetailLabel>
          <DetailLabel label="Publika">
            <span className="text-[12.5px] font-semibold text-ink-900">
              {AUDIENCE_LABEL[item.audience]}
            </span>
          </DetailLabel>
          <DetailLabel label="Autor">
            <div className="flex items-center gap-1.5">
              <span className="h-5 w-5 rounded-full bg-ink-700 text-white grid place-items-center text-[10px] font-bold">
                {item.author.initials}
              </span>
              <span className="text-[12.5px] font-semibold text-ink-900">
                {item.author.name}
              </span>
            </div>
          </DetailLabel>
          <DetailLabel label={item.publishedAt ? "Objavljeno" : "Zakazano"}>
            <span className="text-[12.5px] font-semibold text-ink-900 inline-flex items-center gap-1">
              <Clock size={12} />
              {item.publishedAt || item.scheduledFor || "—"}
            </span>
          </DetailLabel>
          {item.expiresAt && (
            <DetailLabel label="Ističe">
              <span className="text-[12.5px] font-semibold text-ink-900 inline-flex items-center gap-1">
                <CalendarClock size={12} /> {item.expiresAt}
              </span>
            </DetailLabel>
          )}
          {item.pinned && (
            <DetailLabel label="Prikaz">
              <span className="text-[12.5px] font-semibold text-brand-500 inline-flex items-center gap-1">
                <Pin size={12} /> Zakačeno na vrh
              </span>
            </DetailLabel>
          )}
        </div>

        {item.status === "published" && (
          <div>
            <div className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-ink-400 mb-2 px-0.5">
              Performanse
            </div>
            <div className="grid grid-cols-2 gap-3">
              <PerfBox
                label="Pregledi"
                value={item.views.toLocaleString("sr-RS")}
                icon={<Eye size={13} />}
              />
              <PerfBox
                label="Doseg"
                value={item.reach.toLocaleString("sr-RS")}
                icon={<Users size={13} />}
              />
            </div>
            <div className="mt-2 text-[11.5px] text-ink-500">
              CTR{" "}
              <span className="font-bold text-ink-900">
                {((item.views / Math.max(1, item.reach)) * 100).toFixed(1)}%
              </span>
              {" "}· prosečno {Math.round(item.views / 24)} pregleda na sat
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-ink-900 text-white text-[12.5px] font-semibold hover:bg-ink-800">
            <Pencil size={13} /> Izmeni
          </button>
          <button className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-ink-50 ring-1 ring-ink-100 text-ink-700 text-[12.5px] font-semibold hover:bg-ink-100">
            <Pin size={13} /> {item.pinned ? "Otkači" : "Zakači na vrh"}
          </button>
          <button className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-ink-50 ring-1 ring-ink-100 text-ink-700 text-[12.5px] font-semibold hover:bg-ink-100">
            <ArrowUpRight size={13} /> Otvori javni prikaz
          </button>
          {item.status === "published" && (
            <button className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-ink-50 ring-1 ring-ink-100 text-signal-red text-[12.5px] font-semibold hover:bg-signal-red/10">
              <Trash2 size={13} /> Arhiviraj
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-ink-400 mb-1">
        {label}
      </div>
      {children}
    </div>
  );
}

function PerfBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-ink-50 ring-1 ring-ink-100 px-3 py-2.5">
      <div className="text-[10px] font-bold tracking-wide text-ink-400 uppercase inline-flex items-center gap-1">
        {icon} {label}
      </div>
      <div className="text-[20px] font-bold text-ink-900 leading-tight mt-0.5">
        {value}
      </div>
    </div>
  );
}

function Composer({ onClose }: { onClose: () => void }) {
  const [severity, setSeverity] = useState<NewsSeverity>("alert");
  const [audience, setAudience] = useState<"all" | "drivers" | "residents" | "internal">("all");
  const [pinned, setPinned] = useState(true);
  const [headline, setHeadline] = useState("Asfaltiranje noću — Ulica 13. jula");
  const [detail, setDetail] = useState(
    "Jedna traka zatvorena 22:00 — 05:00. Lokalni saobraćaj omogućen, koristite Karađorđevu kao obilaznicu."
  );

  return (
    <div className="rounded-2xl bg-white ring-1 ring-ink-100 sticky top-6 overflow-hidden">
      <div className="px-5 py-3 border-b border-ink-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg bg-brand-500/10 text-brand-500 grid place-items-center">
            <Megaphone size={14} />
          </span>
          <div className="text-[13px] font-bold text-ink-900">Nova objava</div>
        </div>
        <button
          onClick={onClose}
          className="text-[11.5px] font-semibold text-ink-500 hover:text-ink-900"
        >
          Otkaži
        </button>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <Label>Tip obaveštenja</Label>
          <div className="grid grid-cols-4 gap-2 mt-1.5">
            {(Object.keys(SEVERITY_LABEL) as NewsSeverity[]).map((s) => {
              const active = s === severity;
              const c = SEVERITY_COLOR[s];
              return (
                <button
                  key={s}
                  onClick={() => setSeverity(s)}
                  className={`rounded-xl p-2.5 ring-1 transition text-left
                    ${active ? "ring-2 ring-offset-1 ring-brand-500" : "ring-ink-100 hover:ring-ink-200"}`}
                  style={{ background: active ? `${c}15` : "white" }}
                >
                  <span
                    className="block h-1.5 w-6 rounded-full mb-1.5"
                    style={{ background: c }}
                  />
                  <span className="text-[11.5px] font-bold text-ink-900">
                    {SEVERITY_LABEL[s]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Label>Naslov</Label>
          <input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full mt-1.5 h-11 px-3 rounded-xl bg-ink-50 ring-1 ring-ink-100 text-[14px] font-bold text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:bg-white"
          />
        </div>

        <div>
          <Label>Tekst poruke</Label>
          <textarea
            rows={3}
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            className="w-full mt-1.5 px-3 py-2.5 rounded-xl bg-ink-50 ring-1 ring-ink-100 text-[13px] text-ink-900 placeholder-ink-400 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:bg-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Publika</Label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as typeof audience)}
              className="w-full mt-1.5 h-10 px-3 rounded-xl bg-ink-50 ring-1 ring-ink-100 text-[13px] font-semibold text-ink-900"
            >
              <option value="all">Svi korisnici</option>
              <option value="drivers">Vozači</option>
              <option value="residents">Stanovnici</option>
              <option value="internal">Interno (ekipe)</option>
            </select>
          </div>
          <div>
            <Label>Ističe</Label>
            <input
              type="text"
              defaultValue="sutra 05:00"
              className="w-full mt-1.5 h-10 px-3 rounded-xl bg-ink-50 ring-1 ring-ink-100 text-[13px] text-ink-900"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-[12.5px] text-ink-700">
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
            className="h-4 w-4 rounded text-brand-500"
          />
          Zakači na vrh ticker-a (prikaz u građanskoj aplikaciji)
        </label>

        <div className="flex items-center gap-2 pt-3 border-t border-ink-100">
          <button className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-brand-500 text-white text-[13px] font-bold shadow-fab hover:bg-brand-600">
            <Send size={14} /> Objavi sada
          </button>
          <button className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-ink-50 ring-1 ring-ink-100 text-ink-700 text-[13px] font-semibold hover:bg-ink-100">
            <CalendarClock size={14} /> Zakaži
          </button>
          <button className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl text-ink-500 text-[13px] font-semibold hover:bg-ink-50 ml-auto">
            <FileText size={14} /> Sačuvaj nacrt
          </button>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-ink-400">
      {children}
    </div>
  );
}
