import { Flame, ChevronUp, Minus, ChevronDown } from "lucide-react";
import type { Priority } from "./types";
import { PRIORITY_LABEL } from "./mockData";

const STYLES: Record<Priority, { bg: string; fg: string; ring: string; icon: React.ComponentType<{ size?: number }> }> = {
  urgent: { bg: "bg-signal-red/10", fg: "text-signal-red", ring: "ring-signal-red/30", icon: Flame },
  high: { bg: "bg-brand-500/10", fg: "text-brand-500", ring: "ring-brand-500/30", icon: ChevronUp },
  normal: { bg: "bg-ink-100", fg: "text-ink-600", ring: "ring-ink-200", icon: Minus },
  low: { bg: "bg-ink-50", fg: "text-ink-400", ring: "ring-ink-100", icon: ChevronDown },
};

interface Props {
  priority: Priority;
  size?: "sm" | "md";
}

export function PriorityChip({ priority, size = "sm" }: Props) {
  const s = STYLES[priority];
  const Icon = s.icon;
  const cls =
    size === "sm"
      ? "text-[10.5px] px-1.5 py-0.5 gap-1"
      : "text-[12px] px-2.5 py-1 gap-1.5";
  const iconSize = size === "sm" ? 11 : 13;
  return (
    <span
      className={`inline-flex items-center rounded-full font-bold tracking-wide ring-1 ${s.bg} ${s.fg} ${s.ring} ${cls}`}
    >
      <Icon size={iconSize} />
      {PRIORITY_LABEL[priority].toUpperCase()}
    </span>
  );
}
