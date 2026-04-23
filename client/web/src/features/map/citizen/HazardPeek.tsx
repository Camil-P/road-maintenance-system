import { Clock, X } from "lucide-react";
import type { Hazard } from "./types";
import { INCIDENT_TYPES } from "./data";
import { Icons } from "./icons";

interface Props {
  hazard: Hazard;
  onClose: () => void;
}

const BY_LABEL: Record<string, string> = {
  community: "Prijavio učesnik u saobraćaju",
  city: "Proverile gradske službe",
  you: "Ovo ste prijavili vi",
};

export function HazardPeek({ hazard, onClose }: Props) {
  const t = INCIDENT_TYPES.find((x) => x.id === hazard.type) || INCIDENT_TYPES[0];
  const TI = Icons[t.icon] ?? Icons.AlertTriangle;
  const byLabel = BY_LABEL[hazard.reportedBy] || "Prijavljeno";

  return (
    <div
      className="absolute left-3 right-3 z-30 pointer-events-none"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 108px)" }}
    >
      <div
        className="pointer-events-auto mx-auto max-w-md rounded-2xl bg-white/92 backdrop-blur-xl ring-1 ring-black/5 shadow-lift p-3 flex items-center gap-3"
        style={{ animation: "slideUp 220ms ease-out both" }}
      >
        <span
          className="h-11 w-11 rounded-2xl grid place-items-center text-white shrink-0"
          style={{ background: t.color }}
        >
          <TI size={20} />
        </span>
        <div className="flex-1 min-w-0">
          <div
            className="text-[11px] font-bold tracking-[0.14em] uppercase"
            style={{ color: t.color }}
          >
            {t.label}
          </div>
          <div className="text-[14.5px] font-semibold text-ink-900 truncate leading-tight">
            {hazard.note}
          </div>
          <div className="text-[11.5px] text-ink-400 mt-0.5 flex items-center gap-1.5">
            <Clock size={11} />{" "}
            {hazard.minsAgo < 1
              ? "upravo sada"
              : `pre ${hazard.minsAgo} min`}{" "}
            · {byLabel}
          </div>
        </div>
        <button
          onClick={onClose}
          className="h-9 w-9 rounded-full grid place-items-center bg-ink-50 hover:bg-ink-100 text-ink-500"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
