import { Bell, Construction, Route, X } from "lucide-react";
import type { WorkSegment, WorkSeverity } from "./types";

interface Props {
  segment: WorkSegment;
  onClose: () => void;
}

const SEV_META: Record<WorkSeverity, { label: string; color: string; bg: string; txt: string }> = {
  closure: { label: "POTPUNO ZATVORENO", color: "#E5484D", bg: "bg-signal-red/10", txt: "text-signal-red" },
  major: { label: "VEĆI RADOVI", color: "#FF5A1F", bg: "bg-brand-500/10", txt: "text-brand-500" },
  minor: { label: "MANJI RADOVI", color: "#F5A524", bg: "bg-signal-amber/10", txt: "text-signal-amber" },
};

export function WorkSegmentPeek({ segment, onClose }: Props) {
  const sevMeta = SEV_META[segment.severity] ?? SEV_META.major;
  const statusDot = segment.status === "active" ? "bg-signal-green" : "bg-ink-300";

  return (
    <div
      className="absolute left-3 right-3 z-30 pointer-events-none"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 108px)" }}
    >
      <div
        className="pointer-events-auto mx-auto max-w-md rounded-2xl bg-white/94 backdrop-blur-xl ring-1 ring-black/5 shadow-lift overflow-hidden"
        style={{ animation: "slideUp 220ms ease-out both" }}
      >
        <div className="flex items-start gap-3 p-3">
          <span
            className="h-11 w-11 rounded-2xl grid place-items-center text-white shrink-0"
            style={{ background: sevMeta.color }}
          >
            <Construction size={20} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-bold tracking-[0.14em] ${sevMeta.txt}`}>
                {sevMeta.label}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase text-ink-500">
                <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />
                {segment.status === "active" ? "Aktivno sada" : "Zakazano"}
              </span>
            </div>
            <div className="text-[15px] font-semibold text-ink-900 leading-tight mt-0.5 truncate">
              {segment.title}
            </div>
            <div className="text-[12px] text-ink-400 mt-0.5 truncate">{segment.crew}</div>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full grid place-items-center bg-ink-50 hover:bg-ink-100 text-ink-500"
          >
            <X size={16} />
          </button>
        </div>

        <div className={`mx-3 mb-3 rounded-xl ${sevMeta.bg} p-3`}>
          <div className="flex items-center gap-2.5">
            <span
              className="h-6 w-6 rounded-full grid place-items-center text-white shrink-0"
              style={{ background: sevMeta.color }}
            >
              <svg viewBox="0 0 24 24" width="12" height="12">
                <path
                  d="M7 6h10l-2 3 2 3H7z M7 6v14"
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <div className="text-[12px] font-semibold text-ink-900">Početak</div>
            <div className="text-[11.5px] text-ink-500 ml-auto">{segment.startsAt}</div>
          </div>

          <div className="flex items-center ml-[11px] my-1.5">
            <div
              className="w-0.5 h-4 rounded-full"
              style={{ background: sevMeta.color, opacity: 0.4 }}
            />
            <div className="flex-1 ml-2.5 text-[11.5px] text-ink-500 italic line-clamp-2">
              {segment.detail}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className="h-6 w-6 rounded-full grid place-items-center text-white shrink-0 ring-2 ring-white"
              style={{ background: sevMeta.color }}
            >
              <svg viewBox="0 0 24 24" width="12" height="12">
                <g fill="white">
                  <rect x="7" y="6" width="3" height="3" />
                  <rect x="13" y="6" width="3" height="3" />
                  <rect x="10" y="9" width="3" height="3" />
                  <rect x="7" y="12" width="3" height="3" />
                  <rect x="13" y="12" width="3" height="3" />
                </g>
              </svg>
            </span>
            <div className="text-[12px] font-semibold text-ink-900">Kraj</div>
            <div className="text-[11.5px] text-ink-500 ml-auto">{segment.endsAt}</div>
          </div>
        </div>

        <div className="flex gap-2 px-3 pb-3">
          <button className="flex-1 h-11 rounded-xl bg-ink-900 text-white text-[13.5px] font-semibold hover:bg-ink-800 flex items-center justify-center gap-1.5">
            <Route size={15} /> Obilaznica
          </button>
          <button className="flex-1 h-11 rounded-xl bg-ink-50 ring-1 ring-ink-100 text-ink-800 text-[13.5px] font-semibold hover:bg-ink-100 flex items-center justify-center gap-1.5">
            <Bell size={15} /> Obavesti me
          </button>
        </div>
      </div>
    </div>
  );
}
