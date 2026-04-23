// App.jsx — stitches the citizen landing page together.

function App() {
  const [hazards, setHazards]           = React.useState(window.HAZARDS);
  const [workSegments]                  = React.useState(window.WORK_SEGMENTS);
  const [activeSegment, setActiveSegment] = React.useState(null);
  const [reports, setReports]           = React.useState(window.MY_REPORTS);
  const [sheetOpen, setSheetOpen]       = React.useState(false);
  const [reportsOpen, setReportsOpen]   = React.useState(false);
  const [locating, setLocating]         = React.useState(false);
  const [userLoc, setUserLoc]           = React.useState({
    lng: window.CITY_CENTER[0] - 0.003,
    lat: window.CITY_CENTER[1] - 0.002,
  });
  const [toast, setToast] = React.useState(null);
  const [hazardPeek, setHazardPeek] = React.useState(null);

  const handleLocate = () => {
    setLocating(true);
    setTimeout(() => {
      // small jitter to simulate a fresh GPS fix
      const next = {
        lng: window.CITY_CENTER[0] + (Math.random() - 0.5) * 0.004,
        lat: window.CITY_CENTER[1] + (Math.random() - 0.5) * 0.004,
      };
      setUserLoc(next);
      if (window.__mapFlyTo) window.__mapFlyTo(next.lng, next.lat, 15.6);
      setLocating(false);
    }, 700);
  };

  const handleSubmitReport = (r) => {
    setReports(prev => [{ ...r }, ...prev]);
    setHazards(prev => [{
      id: r.id, type: r.type, lng: r.loc.lng, lat: r.loc.lat,
      note: r.note || 'Just reported', reportedBy: 'you', minsAgo: 0,
    }, ...prev]);
    setToast('Report submitted · city crews notified');
  };

  const focusReport = (r) => {
    // Try to match a hazard we have on the map
    const match = hazards.find(h => h.id === r.id);
    if (match && window.__mapFlyTo) {
      window.__mapFlyTo(match.lng, match.lat, 16.4);
    }
    setReportsOpen(false);
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-ink-50 font-sans">
      <MapCanvas
        hazards={hazards}
        workSegments={workSegments}
        userLocation={userLoc}
        pendingLocation={null}
        onHazardClick={(h) => { setHazardPeek(h); setActiveSegment(null); window.__mapFlyTo && window.__mapFlyTo(h.lng, h.lat, 16.2); }}
        onSegmentClick={(id) => {
          const s = workSegments.find(x => x.id === id);
          if (!s) return;
          setActiveSegment(s);
          setHazardPeek(null);
          const mid = s.coords[Math.floor(s.coords.length / 2)];
          window.__mapFlyTo && window.__mapFlyTo(mid[0], mid[1], 15.8);
        }}
      />

      {/* Top floating news ticker */}
      <NewsTicker items={window.NEWS} />

      {/* Right-side control stack */}
      <TopBar
        onOpenReports={() => setReportsOpen(true)}
        onLocate={handleLocate}
        onLayers={() => setToast('Layers coming soon')}
        locating={locating}
        badge={reports.length}
      />

      {/* Hazard peek popover */}
      {hazardPeek && (
        <HazardPeek hazard={hazardPeek} onClose={() => setHazardPeek(null)} />
      )}

      {/* Work segment peek */}
      {activeSegment && (
        <WorkSegmentPeek segment={activeSegment} onClose={() => setActiveSegment(null)} />
      )}

      {/* FAB */}
      <ReportFAB onClick={() => setSheetOpen(true)} />

      {/* Sheets */}
      <ReportSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSubmit={handleSubmitReport}
        userLocation={userLoc}
      />
      <MyReportsSheet
        open={reportsOpen}
        onClose={() => setReportsOpen(false)}
        reports={reports}
        onFocus={focusReport}
      />

      {/* Toast */}
      <Toast toast={toast} onDone={() => setToast(null)} />
    </div>
  );
}

function HazardPeek({ hazard, onClose }) {
  const t = window.INCIDENT_TYPES.find(x => x.id === hazard.type) || window.INCIDENT_TYPES[0];
  const TI = Icons[t.icon] || Icons.AlertTriangle;
  const byLabel = {
    community: 'Reported by a driver',
    city:      'Verified by City Ops',
    you:       'You reported this',
  }[hazard.reportedBy] || 'Reported';

  return (
    <div className="absolute left-3 right-3 z-30 pointer-events-none"
         style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 108px)' }}>
      <div className="pointer-events-auto mx-auto max-w-md rounded-2xl bg-white/92 backdrop-blur-xl ring-1 ring-black/5 shadow-lift p-3 flex items-center gap-3 animate-[slideUp_220ms_ease-out_both]">
        <span className="h-11 w-11 rounded-2xl grid place-items-center text-white shrink-0" style={{ background: t.color }}>
          <TI size={20} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold tracking-[0.14em] uppercase" style={{ color: t.color }}>{t.label}</div>
          <div className="text-[14.5px] font-semibold text-ink-900 truncate leading-tight">{hazard.note}</div>
          <div className="text-[11.5px] text-ink-400 mt-0.5 flex items-center gap-1.5">
            <Icons.Clock size={11} /> {hazard.minsAgo < 1 ? 'just now' : `${hazard.minsAgo} min ago`} · {byLabel}
          </div>
        </div>
        <button onClick={onClose} className="h-9 w-9 rounded-full grid place-items-center bg-ink-50 hover:bg-ink-100 text-ink-500">
          <Icons.X size={16} />
        </button>
      </div>
    </div>
  );
}

window.App = App;

// Mount immediately — this script runs last, after every component
// has attached itself to window, so createRoot is safe here.
(function mount() {
  const el = document.getElementById('root');
  if (!el) { return; }
  ReactDOM.createRoot(el).render(<App />);
})();
