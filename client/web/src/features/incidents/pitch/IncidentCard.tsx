import { Clock, Copy, ImageOff, MapPin, ShieldCheck } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import type { AgencyIncident } from "./types";
import { INCIDENT_TYPES } from "@/features/map/citizen/data";
import { Icons } from "@/features/map/citizen/icons";
import { PriorityChip } from "./PriorityChip";
import { StatusPill } from "./StatusPill";

interface Props {
  incident: AgencyIncident;
  selected?: boolean;
  onClick?: () => void;
}

export function IncidentCard({ incident, selected, onClick }: Props) {
  const meta = INCIDENT_TYPES.find((t) => t.id === incident.type) ?? INCIDENT_TYPES[0];
  const Icon = Icons[meta.icon] ?? AlertTriangle;
  const TrustIcon =
    incident.reporter.trust === "verified" ? ShieldCheck : null;

  return (
    <button
      onClick={onClick}
      className={`group relative w-full text-left rounded-2xl bg-white p-3 transition-all
                  ring-1 ${
                    selected
                      ? "ring-brand-500 shadow-lift"
                      : "ring-ink-100 hover:ring-ink-200 hover:shadow-soft"
                  }`}
    >
      {selected && (
        <span className="absolute -left-[1px] top-3 bottom-3 w-[3px] rounded-r bg-brand-500" />
      )}
      <div className="flex items-start gap-3">
        <span
          className="h-11 w-11 rounded-2xl grid place-items-center text-white shrink-0"
          style={{ background: meta.color }}
        >
          <Icon size={20} />
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[13.5px] font-bold text-ink-900 truncate">
                {incident.address}
              </div>
              <div className="text-[11px] font-semibold tracking-wide text-ink-400 uppercase mt-0.5">
                {meta.label}
              </div>
            </div>
            <PriorityChip priority={incident.priority} />
          </div>

          <div className="text-[12.5px] text-ink-600 mt-1.5 line-clamp-2 leading-snug">
            {incident.note}
          </div>

          <div className="flex items-center gap-2 mt-2 text-[11px] text-ink-400">
            <span className="inline-flex items-center gap-1">
              <Clock size={11} /> {incident.submittedAt}
            </span>
            <span className="text-ink-200">·</span>
            <span className="inline-flex items-center gap-1 min-w-0">
              <span
                className={`h-4 w-4 rounded-full grid place-items-center text-[8.5px] font-bold text-white shrink-0 ${
                  incident.reporter.trust === "anonymous"
                    ? "bg-ink-300"
                    : "bg-ink-700"
                }`}
              >
                {incident.reporter.initials}
              </span>
              <span className="truncate">{incident.reporter.name}</span>
              {TrustIcon && <TrustIcon size={10} className="text-signal-green shrink-0" />}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <StatusPill status={incident.status} />
            {incident.duplicates ? (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-ink-500 bg-ink-50 ring-1 ring-ink-100 rounded-full px-1.5 py-0.5">
                <Copy size={10} /> {incident.duplicates} duplikata
              </span>
            ) : null}
            {incident.workOrderId ? (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-ink-700 bg-ink-50 ring-1 ring-ink-100 rounded-full px-1.5 py-0.5">
                <MapPin size={10} /> {incident.workOrderId}
              </span>
            ) : null}
            {incident.photo ? null : (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-ink-300">
                <ImageOff size={10} /> bez fotografije
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
