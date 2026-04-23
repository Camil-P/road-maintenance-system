import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Layers, List, Loader, Navigation2 } from "lucide-react";

interface Props {
  onOpenReports: () => void;
  onLocate: () => void;
  onLayers: () => void;
  locating?: boolean;
  reportsBadge?: number;
}

export function TopBar({ onOpenReports, onLocate, onLayers, locating, reportsBadge = 3 }: Props) {
  return (
    <div
      className="absolute right-3 z-30 flex flex-col gap-2"
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 108px)" }}
    >
      <IconBtn onClick={onOpenReports} aria-label="Moje prijave" badge={reportsBadge}>
        <List size={20} />
      </IconBtn>
      <IconBtn onClick={onLocate} aria-label="Centriraj na moju lokaciju" active={locating}>
        {locating ? (
          <Loader size={20} className="animate-spin" />
        ) : (
          <Navigation2 size={20} />
        )}
      </IconBtn>
      <IconBtn onClick={onLayers} aria-label="Slojevi mape">
        <Layers size={20} />
      </IconBtn>
    </div>
  );
}

interface IconBtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  badge?: number;
  active?: boolean;
}

function IconBtn({ children, badge, active, className = "", ...rest }: IconBtnProps) {
  return (
    <button
      {...rest}
      className={`relative h-11 w-11 rounded-full grid place-items-center
                  bg-white/85 backdrop-blur-xl ring-1 ring-black/5 shadow-soft
                  text-ink-800 transition-all hover:bg-white active:scale-95
                  ${active ? "text-brand-500" : ""} ${className}`}
    >
      {children}
      {badge ? (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-500 text-white text-[10px] font-bold grid place-items-center ring-2 ring-white">
          {badge}
        </span>
      ) : null}
    </button>
  );
}
