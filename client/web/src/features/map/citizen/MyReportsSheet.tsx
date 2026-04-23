import { useState } from "react";
import { AlertTriangle, ArrowUpRight, Clock, List, Sparkles, X } from "lucide-react";
import type { MyReport, ReportStatus } from "./types";
import { INCIDENT_TYPES } from "./data";
import { Icons } from "./icons";

interface Props {
  open: boolean;
  onClose: () => void;
  reports: MyReport[];
  onFocus?: (r: MyReport) => void;
}

const STATUS_META: Record<
  ReportStatus,
  { label: string; dot: string; text: string; bar: string }
> = {
  received: {
    label: "Primljeno",
    dot: "bg-signal-amber",
    text: "text-signal-amber",
    bar: "w-1/3",
  },
  in_progress: {
    label: "Ekipa na terenu",
    dot: "bg-signal-ice",
    text: "text-signal-ice",
    bar: "w-2/3",
  },
  resolved: {
    label: "Rešeno",
    dot: "bg-signal-green",
    text: "text-signal-green",
    bar: "w-full",
  },
};

export function MyReportsSheet({ open, onClose, reports, onFocus }: Props) {
  const [closing, setClosing] = useState(false);

  const doClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
      setClosing(false);
    }, 230);
  };

  if (!open && !closing) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <div
        className={`absolute inset-0 bg-ink-950/45 backdrop-blur-sm sheet-backdrop ${
          closing ? "closing" : ""
        }`}
        onClick={doClose}
      />
      <div
        className={`relative w-full max-w-lg bg-white rounded-t-[28px] shadow-lift sheet-panel ${
          closing ? "closing" : ""
        }`}
      >
        <div className="flex justify-center pt-2.5 pb-1">
          <span className="h-1.5 w-10 rounded-full bg-ink-200" />
        </div>

        <div className="flex items-start gap-3 px-5 pt-1 pb-3">
          <div className="h-11 w-11 rounded-2xl bg-ink-900 text-white grid place-items-center">
            <List size={22} />
          </div>
          <div className="flex-1">
            <div className="text-[11px] font-bold tracking-[0.14em] text-ink-400">MOJE PRIJAVE</div>
            <div className="text-[19px] font-bold text-ink-900 leading-tight">
              {reports.length} poslato
            </div>
            <div className="text-[12.5px] text-ink-400 mt-0.5">
              Hvala što pomažete da grad ostane u pokretu.
            </div>
          </div>
          <button
            onClick={doClose}
            className="h-9 w-9 rounded-full grid place-items-center bg-ink-50 hover:bg-ink-100 text-ink-500"
            aria-label="Zatvori"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-3 pb-5 max-h-[65vh] overflow-y-auto nice-scroll safe-bottom">
          {reports.length === 0 ? (
            <div className="text-center py-10 px-6">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-ink-50 grid place-items-center text-ink-400">
                <Sparkles size={22} />
              </div>
              <div className="text-[15px] font-semibold text-ink-900 mt-3">Još nema prijava</div>
              <div className="text-[12.5px] text-ink-400 mt-1">
                Pritisnite „Prijavite“ da pošaljete prvu prijavu.
              </div>
            </div>
          ) : (
            <ul className="space-y-2">
              {reports.map((r) => {
                const t = INCIDENT_TYPES.find((x) => x.id === r.type) || INCIDENT_TYPES[0];
                const TI = Icons[t.icon] ?? AlertTriangle;
                const sm = STATUS_META[r.status] || STATUS_META.received;
                return (
                  <li key={r.id}>
                    <button
                      onClick={() => onFocus?.(r)}
                      className="w-full text-left rounded-2xl bg-white ring-1 ring-ink-100 hover:ring-ink-200 p-3 transition"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="h-10 w-10 rounded-xl grid place-items-center text-white shrink-0"
                          style={{ background: t.color }}
                        >
                          <TI size={18} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[15px] font-semibold text-ink-900">
                              {t.label}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 text-[10.5px] font-bold tracking-wide uppercase ${sm.text}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${sm.dot}`} /> {sm.label}
                            </span>
                          </div>
                          <div className="text-[12.5px] text-ink-500 truncate mt-0.5">
                            {r.address}
                          </div>
                          {r.note && (
                            <div className="text-[12px] text-ink-400 mt-0.5 line-clamp-1">
                              "{r.note}"
                            </div>
                          )}
                          <div className="mt-2 h-1 w-full rounded-full bg-ink-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${sm.dot} ${sm.bar} transition-all`}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-1.5 text-[11px] text-ink-400">
                            <span className="inline-flex items-center gap-1">
                              <Clock size={11} /> {r.submitted}
                            </span>
                            <span className="inline-flex items-center gap-1 text-ink-500 font-semibold">
                              Pogledaj na mapi <ArrowUpRight size={12} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
