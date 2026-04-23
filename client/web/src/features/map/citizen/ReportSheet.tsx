import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  ImagePlus,
  Loader,
  LocateFixed,
  SendHorizontal,
  ShieldCheck,
  X,
} from "lucide-react";
import type { IncidentTypeId, MyReport, UserLocation } from "./types";
import { CITY_CENTER, INCIDENT_TYPES } from "./data";
import { Icons } from "./icons";
import { flyTo } from "./mapBridge";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (report: MyReport) => void;
  userLocation: UserLocation | null;
}

export function ReportSheet({ open, onClose, onSubmit, userLocation }: Props) {
  const [closing, setClosing] = useState(false);
  const [type, setType] = useState<IncidentTypeId>("pothole");
  const [typeOpen, setTypeOpen] = useState(false);
  const [note, setNote] = useState("");
  const [loc, setLoc] = useState<UserLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setClosing(false);
      setType("pothole");
      setNote("");
      setLoc(userLocation ? { ...userLocation, address: "Trenutna lokacija" } : null);
      setPhoto(null);
      setSubmitting(false);
      setTypeOpen(false);
    }
  }, [open, userLocation]);

  const doClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
      setClosing(false);
    }, 230);
  };

  const useMyLocation = () => {
    setLocating(true);
    setTimeout(() => {
      const base = userLocation || { lng: CITY_CENTER[0], lat: CITY_CENTER[1] };
      const next: UserLocation = {
        lng: base.lng + (Math.random() - 0.5) * 0.002,
        lat: base.lat + (Math.random() - 0.5) * 0.002,
        address: "Kod Trga slobode i 12. februara",
        accuracy: 8,
      };
      setLoc(next);
      setLocating(false);
      flyTo(next.lng, next.lat, 16.2);
    }, 900);
  };

  const handlePhotoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto((ev.target?.result as string) ?? null);
    reader.readAsDataURL(f);
  };

  const canSubmit = !!type && !!loc && !submitting;

  const submit = () => {
    if (!canSubmit || !loc) return;
    setSubmitting(true);
    setTimeout(() => {
      onSubmit({
        id: "new-" + Date.now(),
        type,
        note,
        loc,
        photo,
        submitted: "upravo sada",
        status: "received",
        address: loc.address || "Označena lokacija",
      });
      doClose();
    }, 650);
  };

  if (!open && !closing) return null;

  const selectedType = INCIDENT_TYPES.find((t) => t.id === type) || INCIDENT_TYPES[0];
  const SelIcon = Icons[selectedType.icon] ?? AlertTriangle;

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
          <div className="h-11 w-11 rounded-2xl bg-brand-500/10 text-brand-500 grid place-items-center">
            <AlertTriangle size={22} />
          </div>
          <div className="flex-1">
            <div className="text-[11px] font-bold tracking-[0.14em] text-brand-500">
              PRIJAVA OPASNOSTI
            </div>
            <div className="text-[19px] font-bold text-ink-900 leading-tight">
              Pomozite da putevi budu bezbedniji
            </div>
            <div className="text-[12.5px] text-ink-400 mt-0.5">
              Gradska ekipa dobija obaveštenje u roku od nekoliko sekundi.
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

        <div className="px-5 pb-4 space-y-3.5 max-h-[65vh] overflow-y-auto nice-scroll">
          <Field label="Šta ste videli?">
            <button
              onClick={() => setTypeOpen((o) => !o)}
              className="w-full flex items-center gap-3 h-14 px-3.5 rounded-2xl bg-ink-50 ring-1 ring-ink-100 text-left active:bg-ink-100 transition"
            >
              <span
                className="h-9 w-9 rounded-xl grid place-items-center text-white shrink-0"
                style={{ background: selectedType.color }}
              >
                <SelIcon size={18} />
              </span>
              <div className="flex-1">
                <div className="text-[11px] font-semibold tracking-wide text-ink-400">
                  VRSTA DOGAĐAJA
                </div>
                <div className="text-[15.5px] font-semibold text-ink-900 leading-tight">
                  {selectedType.label}
                </div>
              </div>
              <ChevronDown
                size={18}
                className={`text-ink-400 transition-transform ${typeOpen ? "rotate-180" : ""}`}
              />
            </button>

            {typeOpen && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {INCIDENT_TYPES.map((t) => {
                  const TI = Icons[t.icon] ?? AlertTriangle;
                  const active = t.id === type;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setType(t.id);
                        setTypeOpen(false);
                      }}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl transition
                        ${
                          active
                            ? "bg-ink-900 text-white"
                            : "bg-ink-50 ring-1 ring-ink-100 text-ink-800 hover:bg-ink-100"
                        }`}
                    >
                      <span
                        className="h-9 w-9 rounded-xl grid place-items-center text-white"
                        style={{ background: t.color }}
                      >
                        <TI size={18} />
                      </span>
                      <span className="text-[12px] font-semibold">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </Field>

          <Field label="Gde?">
            <button
              onClick={useMyLocation}
              disabled={locating}
              className={`w-full flex items-center gap-3 h-14 px-3.5 rounded-2xl text-left transition
                ${
                  loc
                    ? "bg-signal-green/10 ring-1 ring-signal-green/30"
                    : "bg-ink-900 text-white hover:bg-ink-800"
                }`}
            >
              <span
                className={`h-9 w-9 rounded-xl grid place-items-center shrink-0
                ${loc ? "bg-signal-green text-white" : "bg-white/10 text-white"}`}
              >
                {locating ? (
                  <Loader size={18} className="animate-spin" />
                ) : loc ? (
                  <Check size={18} />
                ) : (
                  <LocateFixed size={18} />
                )}
              </span>
              <div className="flex-1 min-w-0">
                {loc ? (
                  <>
                    <div className="text-[11px] font-semibold tracking-wide text-signal-green">
                      GPS · ±{loc.accuracy || 12} m
                    </div>
                    <div className="text-[14.5px] font-semibold text-ink-900 truncate">
                      {loc.address}
                    </div>
                    <div className="text-[11px] font-mono text-ink-400 truncate">
                      {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-[11px] font-semibold tracking-wide text-white/70">
                      DODIRNITE ZA LOKACIJU
                    </div>
                    <div className="text-[15.5px] font-semibold leading-tight">
                      Koristi moju trenutnu lokaciju
                    </div>
                  </>
                )}
              </div>
              {loc && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setLoc(null);
                  }}
                  className="text-[12px] font-semibold text-ink-500 underline-offset-2 hover:underline"
                >
                  Promeni
                </span>
              )}
            </button>
          </Field>

          <Field label="Dodajte fotografiju (opciono)">
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
                    <div className="text-[11px] font-semibold tracking-wide text-ink-400">
                      FOTOGRAFIJA DODATA
                    </div>
                    <div className="text-[14.5px] font-semibold text-ink-900">Dodirnite da zamenite</div>
                  </div>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhoto(null);
                    }}
                    className="text-[12px] font-semibold text-ink-500 hover:underline"
                  >
                    Ukloni
                  </span>
                </>
              ) : (
                <>
                  <span className="h-9 w-9 rounded-xl grid place-items-center bg-white text-ink-700 ring-1 ring-ink-200">
                    <ImagePlus size={18} />
                  </span>
                  <div className="flex-1">
                    <div className="text-[11px] font-semibold tracking-wide text-ink-400">
                      KAMERA / GALERIJA
                    </div>
                    <div className="text-[14.5px] font-semibold text-ink-900">
                      Snimite ili otpremite fotografiju
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-ink-400" />
                </>
              )}
            </button>
          </Field>

          <Field label="Još nešto? (opciono)">
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="npr. desna traka, odmah posle mosta…"
              className="w-full resize-none rounded-2xl bg-ink-50 ring-1 ring-ink-100 px-3.5 py-3 text-[14.5px] text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:bg-white transition"
            />
          </Field>
        </div>

        <div className="px-5 pt-2 pb-5 safe-bottom border-t border-ink-100 bg-white rounded-t-[28px]">
          <button
            onClick={submit}
            disabled={!canSubmit}
            className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2
                        text-[16px] font-bold transition-all
                        ${
                          canSubmit
                            ? "bg-brand-500 hover:bg-brand-600 text-white shadow-fab active:scale-[0.98]"
                            : "bg-ink-100 text-ink-400 cursor-not-allowed"
                        }`}
          >
            {submitting ? (
              <>
                <Loader size={18} className="animate-spin" /> Šaljem…
              </>
            ) : (
              <>
                <SendHorizontal size={18} /> Pošalji prijavu
              </>
            )}
          </button>
          <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[11.5px] text-ink-400">
            <ShieldCheck size={13} /> Anonimno · lični podaci se ne dele
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-[11.5px] font-bold tracking-[0.08em] text-ink-400 uppercase mb-1.5 px-0.5">
        {label}
      </div>
      {children}
    </div>
  );
}
