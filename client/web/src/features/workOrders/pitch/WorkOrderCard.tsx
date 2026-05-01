import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  Clock,
  Coins,
  Truck,
} from "lucide-react";
import { AlertTriangle } from "lucide-react";
import type { WorkOrder } from "./types";
import { WORK_TYPE_LABEL } from "./mockData";
import { INCIDENT_TYPES } from "@/features/map/citizen/data";
import { Icons } from "@/features/map/citizen/icons";
import { PriorityChip } from "@/features/incidents/pitch/PriorityChip";
import { WorkPhoto } from "./WorkPhoto";

interface Props {
  order: WorkOrder;
  onClick?: () => void;
}

export function WorkOrderCard({ order, onClick }: Props) {
  const meta =
    INCIDENT_TYPES.find((t) => t.id === order.incidentType) ?? INCIDENT_TYPES[0];
  const Icon = Icons[meta.icon] ?? AlertTriangle;
  const isCompleted = order.status === "completed";

  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-2xl bg-white ring-1 ring-ink-100 hover:ring-ink-200 hover:shadow-soft transition overflow-hidden"
    >
      <div className="relative">
        <div className="grid grid-cols-2 gap-px bg-ink-100">
          <div className="relative h-28 overflow-hidden">
            <WorkPhoto workType={order.workType} phase="before" />
            <span className="absolute top-1.5 left-1.5 text-[9.5px] font-bold tracking-[0.14em] uppercase bg-black/55 text-white rounded-full px-2 py-0.5 backdrop-blur">
              Pre
            </span>
          </div>
          <div className="relative h-28 overflow-hidden">
            {isCompleted ? (
              <WorkPhoto workType={order.workType} phase="after" />
            ) : (
              <PendingAfter />
            )}
            <span
              className={`absolute top-1.5 left-1.5 text-[9.5px] font-bold tracking-[0.14em] uppercase rounded-full px-2 py-0.5 backdrop-blur
                ${
                  isCompleted
                    ? "bg-signal-green/90 text-white"
                    : "bg-white/90 text-ink-500 ring-1 ring-ink-200"
                }`}
            >
              Posle
            </span>
          </div>
        </div>

        <div className="absolute top-1.5 right-1.5">
          <PriorityChip priority={order.priority} />
        </div>
      </div>

      <div className="p-3 space-y-2.5">
        <div className="flex items-start gap-2.5">
          <span
            className="h-9 w-9 rounded-xl grid place-items-center text-white shrink-0"
            style={{ background: meta.color }}
          >
            <Icon size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[10.5px] font-bold tracking-[0.14em] text-ink-400 uppercase">
              {WORK_TYPE_LABEL[order.workType]}
            </div>
            <div className="text-[14px] font-bold text-ink-900 leading-tight">
              {order.title}
            </div>
            <div className="text-[11.5px] text-ink-500 mt-0.5 truncate">
              {order.address}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-ink-50 ring-1 ring-ink-100 px-2.5 py-2">
          <span
            className={`h-7 w-7 rounded-lg grid place-items-center shrink-0 ${
              order.crew.available
                ? "bg-signal-green text-white"
                : "bg-signal-amber text-white"
            }`}
          >
            <Truck size={13} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-bold text-ink-900 truncate">
              {order.crew.name}
            </div>
            <div className="text-[10.5px] text-ink-500 truncate">
              {order.crew.vehicle} · {order.crew.members} članova
            </div>
          </div>
        </div>

        <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-[11px] text-ink-500">
          <span className="inline-flex items-center gap-1">
            <CalendarClock size={11} /> {order.scheduledFor}
          </span>
          {order.completedAt ? (
            <span className="inline-flex items-center gap-1 text-signal-green font-semibold">
              <Clock size={11} /> {order.durationHours?.toFixed(1)} h
            </span>
          ) : null}
          {order.cost ? (
            <span className="inline-flex items-center gap-1">
              <Coins size={11} /> {order.cost.toLocaleString("sr-RS")} €
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between text-[11px] text-ink-400 pt-1 border-t border-ink-100">
          <span className="inline-flex items-center gap-1 font-mono font-semibold">
            <ClipboardList size={11} /> {order.id}
          </span>
          <span className="inline-flex items-center gap-1 text-ink-700 font-semibold opacity-0 group-hover:opacity-100 transition">
            Detalji <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </button>
  );
}

function PendingAfter() {
  return (
    <div className="h-full w-full grid place-items-center bg-[repeating-linear-gradient(135deg,#F4F5F8,#F4F5F8_8px,#E6E8ED_8px,#E6E8ED_16px)]">
      <div className="text-[10.5px] font-bold tracking-[0.18em] text-ink-400 uppercase">
        u toku
      </div>
    </div>
  );
}
