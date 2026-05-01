import { useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock,
  Copy,
  ImageOff,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  Truck,
  User,
  X,
  XCircle,
} from "lucide-react";
import type { AgencyIncident, AgencyStatus, CrewSummary, Priority } from "./types";
import { CREWS, STATUS_LABEL } from "./mockData";
import { INCIDENT_TYPES } from "@/features/map/citizen/data";
import { Icons } from "@/features/map/citizen/icons";
import { PriorityChip } from "./PriorityChip";

interface Props {
  incident: AgencyIncident;
  onClose: () => void;
}

const TIMELINE: { id: AgencyStatus; label: string }[] = [
  { id: "new", label: "Primljeno" },
  { id: "triaged", label: "Triaž" },
  { id: "in_progress", label: "U toku" },
  { id: "resolved", label: "Rešeno" },
];

const PRIORITY_OPTIONS: Priority[] = ["urgent", "high", "normal", "low"];

export function IncidentDetail({ incident, onClose }: Props) {
  const meta =
    INCIDENT_TYPES.find((t) => t.id === incident.type) ?? INCIDENT_TYPES[0];
  const Icon = Icons[meta.icon] ?? AlertTriangle;
  const [priority, setPriority] = useState<Priority>(incident.priority);
  const [crewOpen, setCrewOpen] = useState(false);
  const [crew, setCrew] = useState<CrewSummary | null>(
    incident.assignedCrew ?? null
  );
  const [note, setNote] = useState("");

  const currentStepIdx =
    incident.status === "dismissed"
      ? -1
      : TIMELINE.findIndex((t) => t.id === incident.status);

  return (
    <div
      className="absolute right-0 top-0 bottom-0 z-30 w-full max-w-[440px] bg-white shadow-lift border-l border-ink-100 flex flex-col"
      style={{
        fontFamily: "Inter Tight, system-ui, sans-serif",
        animation: "slideLeft 240ms cubic-bezier(.2,.8,.2,1) both",
      }}
    >
      <div className="relative shrink-0">
        {incident.photo ? (
          <img
            src={incident.photo}
            alt={incident.address}
            className="h-48 w-full object-cover"
          />
        ) : (
          <div className="h-32 w-full bg-ink-50 grid place-items-center text-ink-300">
            <ImageOff size={28} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-transparent to-black/35 pointer-events-none" />
        <button
          onClick={onClose}
          className="absolute top-3 right-3 h-9 w-9 rounded-full grid place-items-center bg-white/90 backdrop-blur ring-1 ring-black/5 shadow-soft text-ink-700 hover:bg-white"
          aria-label="Zatvori"
        >
          <X size={16} />
        </button>
        <div className="absolute left-3 bottom-3 flex items-center gap-2">
          <span
            className="h-9 w-9 rounded-xl grid place-items-center text-white shadow-soft"
            style={{ background: meta.color }}
          >
            <Icon size={18} />
          </span>
          <PriorityChip priority={incident.priority} size="md" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto nice-scroll px-5 py-4 space-y-4">
        <div>
          <div className="text-[11px] font-bold tracking-[0.14em] uppercase" style={{ color: meta.color }}>
            {meta.label}
          </div>
          <div className="text-[19px] font-bold text-ink-900 leading-tight mt-0.5">
            {incident.address}
          </div>
          <div className="text-[12.5px] text-ink-500 mt-1.5 leading-relaxed">
            {incident.note}
          </div>
          <div className="flex items-center gap-2 mt-2.5 text-[11.5px] text-ink-400">
            <Clock size={12} /> {incident.submittedAt}
            <span>·</span>
            <MapPin size={12} />
            <span className="font-mono">
              {incident.lat.toFixed(5)}, {incident.lng.toFixed(5)}
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-ink-50 ring-1 ring-ink-100 p-3">
          <div className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-ink-400 mb-2">
            Tok prijave
          </div>
          <div className="flex items-center gap-1">
            {TIMELINE.map((step, idx) => {
              const done = idx <= currentStepIdx;
              const current = idx === currentStepIdx;
              return (
                <div key={step.id} className="flex-1 flex flex-col items-center">
                  <div className="flex items-center w-full">
                    {idx > 0 && (
                      <div
                        className={`flex-1 h-0.5 ${
                          done ? "bg-brand-500" : "bg-ink-200"
                        }`}
                      />
                    )}
                    <div
                      className={`h-7 w-7 rounded-full grid place-items-center shrink-0 transition
                        ${
                          done
                            ? "bg-brand-500 text-white"
                            : "bg-white text-ink-300 ring-1 ring-ink-200"
                        }
                        ${current ? "ring-4 ring-brand-500/20" : ""}`}
                    >
                      {done ? <Check size={14} /> : <span className="text-[11px] font-bold">{idx + 1}</span>}
                    </div>
                    {idx < TIMELINE.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 ${
                          idx < currentStepIdx ? "bg-brand-500" : "bg-ink-200"
                        }`}
                      />
                    )}
                  </div>
                  <div
                    className={`text-[10.5px] mt-1.5 font-semibold ${
                      done ? "text-ink-900" : "text-ink-400"
                    }`}
                  >
                    {step.label}
                  </div>
                </div>
              );
            })}
          </div>
          {incident.status === "dismissed" && (
            <div className="mt-3 text-[12px] text-signal-red font-semibold inline-flex items-center gap-1.5">
              <XCircle size={13} /> Prijava odbačena (duplikat / nije relevantno)
            </div>
          )}
        </div>

        <div>
          <div className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-ink-400 mb-2 px-0.5">
            Prioritet
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRIORITY_OPTIONS.map((p) => {
              const active = p === priority;
              return (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`transition rounded-full ${
                    active ? "ring-2 ring-offset-1 ring-brand-500" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <PriorityChip priority={p} size="md" />
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2 px-0.5">
            <div className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-ink-400">
              Dodeljena ekipa
            </div>
            {crew && (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-signal-green">
                <CheckCircle2 size={11} /> Aktivno
              </span>
            )}
          </div>

          <button
            onClick={() => setCrewOpen((o) => !o)}
            className={`w-full flex items-center gap-3 rounded-2xl p-3 text-left transition
              ${
                crew
                  ? "bg-signal-green/10 ring-1 ring-signal-green/30"
                  : "bg-ink-50 ring-1 ring-ink-100 hover:bg-ink-100"
              }`}
          >
            <span
              className={`h-10 w-10 rounded-xl grid place-items-center shrink-0 ${
                crew ? "bg-signal-green text-white" : "bg-white text-ink-500 ring-1 ring-ink-200"
              }`}
            >
              <Truck size={18} />
            </span>
            <div className="flex-1 min-w-0">
              {crew ? (
                <>
                  <div className="text-[13.5px] font-bold text-ink-900 truncate">{crew.name}</div>
                  <div className="text-[11.5px] text-ink-500 truncate">
                    {crew.vehicle} · {crew.members} članova
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[13.5px] font-semibold text-ink-700">
                    Dodeli ekipu
                  </div>
                  <div className="text-[11.5px] text-ink-400">
                    Izaberi sa spiska dostupnih
                  </div>
                </>
              )}
            </div>
            <ChevronDown
              size={16}
              className={`text-ink-400 transition-transform ${crewOpen ? "rotate-180" : ""}`}
            />
          </button>

          {crewOpen && (
            <div className="mt-2 space-y-1.5">
              {CREWS.map((c) => {
                const active = crew?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCrew(c);
                      setCrewOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 rounded-xl p-2.5 text-left transition ring-1
                      ${
                        active
                          ? "bg-brand-500/5 ring-brand-500/30"
                          : "bg-white ring-ink-100 hover:bg-ink-50"
                      }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${
                        c.available ? "bg-signal-green" : "bg-signal-amber"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-ink-900 truncate">
                        {c.name}
                      </div>
                      <div className="text-[11px] text-ink-400 truncate">
                        {c.vehicle} · {c.members} članova
                      </div>
                    </div>
                    <span
                      className={`text-[10.5px] font-semibold ${
                        c.available ? "text-signal-green" : "text-signal-amber"
                      }`}
                    >
                      {c.available ? "Slobodno" : "Zauzeto"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-ink-50 ring-1 ring-ink-100 p-3">
          <div className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-ink-400 mb-2">
            Prijavilac
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`h-10 w-10 rounded-full grid place-items-center text-[13px] font-bold text-white ${
                incident.reporter.trust === "anonymous"
                  ? "bg-ink-300"
                  : "bg-ink-700"
              }`}
            >
              {incident.reporter.initials}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-bold text-ink-900 truncate inline-flex items-center gap-1.5">
                {incident.reporter.name}
                {incident.reporter.trust === "verified" && (
                  <ShieldCheck size={13} className="text-signal-green" />
                )}
              </div>
              <div className="text-[11.5px] text-ink-500">
                {incident.reporter.trust === "verified"
                  ? "Verifikovan korisnik"
                  : incident.reporter.trust === "anonymous"
                    ? "Anonimna prijava"
                    : "Redovni korisnik"}
              </div>
            </div>
            <button className="h-9 w-9 rounded-full grid place-items-center bg-white ring-1 ring-ink-200 text-ink-600 hover:bg-ink-50">
              <Phone size={14} />
            </button>
            <button className="h-9 w-9 rounded-full grid place-items-center bg-white ring-1 ring-ink-200 text-ink-600 hover:bg-ink-50">
              <MessageSquare size={14} />
            </button>
          </div>
          {incident.duplicates ? (
            <div className="mt-2.5 text-[11.5px] text-ink-500 inline-flex items-center gap-1.5 bg-white rounded-full px-2.5 py-1 ring-1 ring-ink-100">
              <Copy size={11} /> Isti problem prijavilo još {incident.duplicates} korisnika
            </div>
          ) : null}
        </div>

        <div>
          <div className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-ink-400 mb-2 px-0.5">
            Interna napomena
          </div>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Dodajte napomenu za ekipu…"
            className="w-full resize-none rounded-2xl bg-ink-50 ring-1 ring-ink-100 px-3 py-2.5 text-[13px] text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 text-[12px]">
          <button className="inline-flex items-center gap-1.5 rounded-full px-3 h-8 bg-ink-50 ring-1 ring-ink-100 text-ink-600 hover:bg-ink-100">
            <Copy size={12} /> Označi kao duplikat
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-full px-3 h-8 bg-ink-50 ring-1 ring-ink-100 text-signal-red hover:bg-signal-red/10">
            <XCircle size={12} /> Odbaci
          </button>
        </div>
      </div>

      <div className="px-5 pt-3 pb-5 border-t border-ink-100 bg-white safe-bottom">
        {incident.workOrderId ? (
          <button className="w-full h-12 rounded-2xl bg-ink-900 hover:bg-ink-800 text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-soft transition active:scale-[0.99]">
            <ClipboardCheck size={16} /> Otvori radni nalog · {incident.workOrderId}
            <ArrowUpRight size={14} className="opacity-70" />
          </button>
        ) : (
          <button className="w-full h-12 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-fab transition active:scale-[0.99]">
            <Send size={16} /> Kreiraj radni nalog
          </button>
        )}
        <div className="flex items-center justify-center gap-1.5 mt-2 text-[11px] text-ink-400">
          <User size={11} /> Dispečer: Aleksandar P. · {STATUS_LABEL[incident.status]}
        </div>
      </div>
    </div>
  );
}
