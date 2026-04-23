// ReportFAB.jsx — prominent bottom-right FAB to launch the report flow.

function ReportFAB({ onClick }) {
  return (
    <div className="absolute z-30 right-4 safe-bottom" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}>
      <button
        onClick={onClick}
        className="group relative flex items-center gap-2.5 pl-4 pr-5 h-16 rounded-full
                   bg-brand-500 hover:bg-brand-600 active:scale-[0.97] transition-all
                   text-white shadow-fab ring-4 ring-brand-500/15"
      >
        <span className="grid place-items-center h-10 w-10 rounded-full bg-white/15">
          <Icons.AlertTriangle size={22} />
        </span>
        <span className="flex flex-col items-start leading-none whitespace-nowrap">
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/70">Spot a hazard?</span>
          <span className="text-[17px] font-bold mt-1">Report it</span>
        </span>

        {/* subtle outer pulse */}
        <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-brand-500/40 animate-ping opacity-40" />
      </button>
    </div>
  );
}

window.ReportFAB = ReportFAB;
