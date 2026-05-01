import type { AgencyStatus } from "./types";
import { STATUS_LABEL } from "./mockData";

const STYLES: Record<AgencyStatus, string> = {
  new: "bg-brand-500 text-white",
  triaged: "bg-signal-amber/15 text-signal-amber ring-1 ring-signal-amber/30",
  in_progress: "bg-signal-ice/15 text-[#0F7AB3] ring-1 ring-signal-ice/40",
  resolved: "bg-signal-green/15 text-signal-green ring-1 ring-signal-green/30",
  dismissed: "bg-ink-100 text-ink-500 ring-1 ring-ink-200",
};

interface Props {
  status: AgencyStatus;
  size?: "sm" | "md";
}

export function StatusPill({ status, size = "sm" }: Props) {
  const cls =
    size === "sm"
      ? "text-[10.5px] px-2 py-0.5"
      : "text-[12px] px-2.5 py-1";
  return (
    <span
      className={`inline-flex items-center rounded-full font-bold tracking-wide uppercase ${STYLES[status]} ${cls}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
