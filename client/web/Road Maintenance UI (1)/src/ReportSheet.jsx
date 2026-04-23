// ReportSheet.jsx — Bottom sheet with the simplified report form.

function ReportSheet({ open, onClose, onSubmit, userLocation }) {
  const [closing, setClosing]   = React.useState(false);
  const [type, setType]         = React.useState('pothole');
  const [typeOpen, setTypeOpen] = React.useState(false);
  const [note, setNote]         = React.useState('');
  const [loc, setLoc]           = React.useState(null);        // {lng,lat,address}
  const [locating, setLocating] = React.useState(false);
  const [photo, setPhoto]       = React.useState(null);        // data url
  const fileRef = React.useRef(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Reset form when opening
  React.useEffect(() => {
    if (open) {
      setClosing(false);
      setType('pothole');
      setNote('');
      setLoc(userLocation ? { ...userLocation, address: 'Current location' } : null);
      setPhoto(null);
      setSubmitting(false);
      setTypeOpen(false);
    }
  }, [open, userLocation]);

  const doClose = () => {
    setClosing(true);
    setTimeout(() => { onClose(); setClosing(false); }, 230);
  };

  const useMyLocation = () => {
    setLocating(true);
    // Mock a quick GPS grab with a slight jitter around the city center
    setTimeout(() => {
      const base = userLocation || { lng: window.CITY_CENTER[0], lat: window.CITY_CENTER[1] };
      const next = {
        lng: base.lng + (Math.random() - 0.5) * 0.002,
        lat: base.lat + (Math.random() - 0.5) * 0.002,
        address: 'Near SW 5th Ave & Morrison St',
        accuracy: 8,
      };
      setLoc(next);
      setLocating(false);
      if (window.__mapFlyTo) window.__mapFlyTo(next.lng, next.lat, 16.2);
    }, 900);
  };

  const handlePhotoPick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(f);
  };

  const canSubmit = !!type && !!loc && !submitting;

  const submit = () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setTimeout(() => {
      onSubmit({
        type, note, loc, photo,
        id: 'new-' + Date.now(),
        submitted: 'Just now',
        status: 'received',
        address: loc.address || 'Pinned location',
      });
      doClose();
    }, 650);
  };

  if (!open && !closing) return null;

  const selectedType = window.INCIDENT_TYPES.find(t => t.id === type);
  const SelIcon = Icons[selectedType.icon] || Icons.AlertTriangle;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <div
        className={`absolute inset-0 bg-ink-950/45 backdrop-blur-sm sheet-backdrop ${closing ? 'closing' : ''}`}
        onClick={doClose}
      />

      <div className={`relative w-full max-w-lg bg-white rounded-t-[28px] shadow-lift sheet-panel ${closing ? 'closing' : ''}`}>
        {/* Grabber */}
        <div className="flex justify-center pt-2.5 pb-1">
          <span className="h-1.5 w-10 rounded-full bg-ink-200" />
        </div>

        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-1 pb-3">
          <div className="h-11 w-11 rounded-2xl bg-brand-500/10 text-brand-500 grid place-items-center">
            <Icons.AlertTriangle size={22} />
          </div>
          <div className="flex-1">
            <div className="text-[11px] font-bold tracking-[0.14em] text-brand-500">REPORT A HAZARD</div>
            <div className="text-[19px] font-bold text-ink-900 leading-tight">Help keep roads safe</div>
            <div className="text-[12.5px] text-ink-400 mt-0.5">City crews are alerted within seconds.</div>
          </div>
          <button
            onClick={doClose}
            className="h-9 w-9 rounded-full grid place-items-center bg-ink-50 hover:bg-ink-100 text-ink-500"
            aria-label="Close"
          >
            <Icons.X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-4 space-y-3.5 max-h-[65vh] overflow-y-auto nice-scroll">
          {/* Type */}
          <Field label="What did you see?">
            <button
              onClick={() => setTypeOpen(o => !o)}
              className="w-full flex items-center gap-3 h-14 px-3.5 rounded-2xl bg-ink-50 ring-1 ring-ink-100 text-left active:bg-ink-100 transition"
            >
              <span className="h-9 w-9 rounded-xl grid place-items-center text-white shrink-0"
                    style={{ background: selectedType.color }}>
                <SelIcon size={18} />
              </span>
              <div className="flex-1">
                <div className="text-[11px] font-semibold tracking-wide text-ink-400">INCIDENT TYPE</div>
                <div className="text-[15.5px] font-semibold text-ink-900 leading-tight">{selectedType.label}</div>
              </div>
              <Icons.ChevronDown size={18} className={`text-ink-400 transition-transform ${typeOpen ? 'rotate-180' : ''}`} />
            </button>

            {typeOpen && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {window.INCIDENT_TYPES.map(t => {
                  const TI = Icons[t.icon] || Icons.AlertTriangle;
                  const active = t.id === type;
                  return (
                    <button
                      key={t.id}
                      onClick={() => { setType(t.id); setTypeOpen(false); }}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl transition
                        ${active
                          ? 'bg-ink-900 text-white'
                          : 'bg-ink-50 ring-1 ring-ink-100 text-ink-800 hover:bg-ink-100'}`}
                    >
                      <span className="h-9 w-9 rounded-xl grid place-items-center text-white"
                            style={{ background: t.color }}>
                        <TI size={18} />
                      </span>
                      <span className="text-[12px] font-semibold">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </Field>

          {/* Location */}
          <Field label="Where?">
            <button
              onClick={useMyLocation}
              disabled={locating}
              className={`w-full flex items-center gap-3 h-14 px-3.5 rounded-2xl text-left transition
                ${loc
                  ? 'bg-signal-green/10 ring-1 ring-signal-green/30'
                  : 'bg-ink-900 text-white hover:bg-ink-800'}`}
            >
              <span className={`h-9 w-9 rounded-xl grid place-items-center shrink-0
                ${loc ? 'bg-signal-green text-white' : 'bg-white/10 text-white'}`}>
                {locating
                  ? <Icons.Loader size={18} className="animate-spin" />
                  : loc
                    ? <Icons.Check size={18} />
                    : <Icons.Locate size={18} />}
              </span>
              <div className="flex-1 min-w-0">
                {loc ? (
                  <>
                    <div className="text-[11px] font-semibold tracking-wide text-signal-green">GPS LOCKED · ±{loc.accuracy || 12}m</div>
                    <div className="text-[14.5px] font-semibold text-ink-900 truncate">{loc.address}</div>
                    <div className="text-[11px] font-mono text-ink-400 truncate">{loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}</div>
                  </>
                ) : (
                  <>
                    <div className="text-[11px] font-semibold tracking-wide text-white/70">TAP TO PIN</div>
                    <div className="text-[15.5px] font-semibold leading-tight">Use my current location</div>
                  </>
                )}
              </div>
              {loc && (
                <span
                  onClick={(e) => { e.stopPropagation(); setLoc(null); }}
                  className="text-[12px] font-semibold text-ink-500 underline-offset-2 hover:underline"
                >
                  Change
                </span>
              )}
            </button>
          </Field>

          {/* Photo */}
          <Field label="Add a photo (optional)">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoPick}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center gap-3 h-14 px-3.5 rounded-2xl bg-ink-50 ring-1 ring-dashed ring-ink-200 text-left hover:bg-ink-100 transition"
            >
              {photo ? (
                <>
                  <img src={photo} alt="" className="h-9 w-9 rounded-xl object-cover" />
                  <div className="flex-1">
                    <div className="text-[11px] font-semibold tracking-wide text-ink-400">PHOTO ATTACHED</div>
                    <div className="text-[14.5px] font-semibold text-ink-900">Tap to replace</div>
                  </div>
                  <span
                    onClick={(e) => { e.stopPropagation(); setPhoto(null); }}
                    className="text-[12px] font-semibold text-ink-500 hover:underline"
                  >
                    Remove
                  </span>
                </>
              ) : (
                <>
                  <span className="h-9 w-9 rounded-xl grid place-items-center bg-white text-ink-700 ring-1 ring-ink-200">
                    <Icons.ImagePlus size={18} />
                  </span>
                  <div className="flex-1">
                    <div className="text-[11px] font-semibold tracking-wide text-ink-400">CAMERA / LIBRARY</div>
                    <div className="text-[14.5px] font-semibold text-ink-900">Take or upload a photo</div>
                  </div>
                  <Icons.ChevronRight size={18} className="text-ink-400" />
                </>
              )}
            </button>
          </Field>

          {/* Note */}
          <Field label="Anything else? (optional)">
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Right lane, just past the bridge…"
              className="w-full resize-none rounded-2xl bg-ink-50 ring-1 ring-ink-100 px-3.5 py-3 text-[14.5px] text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:bg-white transition"
            />
          </Field>
        </div>

        {/* Submit */}
        <div className="px-5 pt-2 pb-5 safe-bottom border-t border-ink-100 bg-white rounded-t-[28px]">
          <button
            onClick={submit}
            disabled={!canSubmit}
            className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2
                        text-[16px] font-bold transition-all
                        ${canSubmit
                          ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-fab active:scale-[0.98]'
                          : 'bg-ink-100 text-ink-400 cursor-not-allowed'}`}
          >
            {submitting
              ? (<><Icons.Loader size={18} className="animate-spin" /> Submitting…</>)
              : (<><Icons.Send size={18} /> Submit report</>)}
          </button>
          <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[11.5px] text-ink-400">
            <Icons.Shield size={13} /> Anonymous · No personal data shared
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-[11.5px] font-bold tracking-[0.08em] text-ink-400 uppercase mb-1.5 px-0.5">{label}</div>
      {children}
    </div>
  );
}

window.ReportSheet = ReportSheet;
