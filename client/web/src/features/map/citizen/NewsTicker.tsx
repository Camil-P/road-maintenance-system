import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { NewsItem, NewsSeverity } from "./types";

interface Props {
  items: NewsItem[];
}

const SEV_STYLES: Record<
  NewsSeverity,
  { dot: string; label: string; labelCls: string }
> = {
  closure: { dot: "bg-signal-red", label: "ZATVORENO", labelCls: "text-signal-red" },
  alert: { dot: "bg-signal-amber", label: "UPOZORENJE", labelCls: "text-signal-amber" },
  info: { dot: "bg-signal-green", label: "NOVOSTI", labelCls: "text-signal-green" },
};

export function NewsTicker({ items }: Props) {
  const [idx, setIdx] = useState(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (expanded) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 6000);
    return () => clearInterval(t);
  }, [items.length, expanded]);

  if (items.length === 0) return null;

  const current = items[idx];
  const s = SEV_STYLES[current.severity] || SEV_STYLES.info;

  return (
    <div className="absolute left-3 right-3 top-3 safe-top z-30 pointer-events-none">
      <div
        className="pointer-events-auto mx-auto max-w-md rounded-2xl bg-white/75 backdrop-blur-xl backdrop-saturate-150 ring-1 ring-black/5 shadow-lift overflow-hidden cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-2 px-3.5 pt-3 pb-1.5">
          <span className="relative flex h-2 w-2">
            <span className={`absolute inset-0 rounded-full ${s.dot} opacity-75 animate-ping`} />
            <span className={`relative rounded-full h-2 w-2 ${s.dot}`} />
          </span>
          <span className={`text-[10px] font-bold tracking-[0.14em] ${s.labelCls} whitespace-nowrap`}>
            {s.label}
          </span>
          <span className="text-[10px] font-medium text-ink-400 tracking-wide whitespace-nowrap truncate">
            · UŽIVO · GRADSKE SLUŽBE
          </span>
          <div className="ml-auto flex items-center gap-1 text-ink-400 text-[11px] font-medium">
            {idx + 1}/{items.length}
            <ChevronDown
              size={14}
              className={`transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </div>
        </div>

        <div className="px-3.5 pb-3 min-h-[44px]">
          <div key={current.id} className="ticker-item">
            <div className="text-[15px] font-semibold text-ink-900 leading-tight">
              {current.headline}
            </div>
            <div className="text-[12.5px] text-ink-500 mt-0.5 leading-snug">
              {current.detail}
            </div>
          </div>
        </div>

        {expanded && (
          <div className="border-t border-ink-100 bg-white/60 max-h-72 overflow-y-auto nice-scroll">
            {items.map((n, i) => {
              const ns = SEV_STYLES[n.severity] || SEV_STYLES.info;
              return (
                <button
                  key={n.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIdx(i);
                    setExpanded(false);
                  }}
                  className="w-full text-left flex gap-3 px-3.5 py-2.5 hover:bg-black/5 transition-colors border-b border-ink-100/60 last:border-b-0"
                >
                  <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${ns.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-[10px] font-bold tracking-[0.14em] ${ns.labelCls}`}>
                      {ns.label}
                    </div>
                    <div className="text-[13.5px] font-semibold text-ink-900 leading-tight mt-0.5 truncate">
                      {n.headline}
                    </div>
                    <div className="text-[12px] text-ink-500 mt-0.5 line-clamp-2">{n.detail}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
