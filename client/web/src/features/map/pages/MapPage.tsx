import { useState } from "react";
import { MapCanvas } from "../citizen/MapCanvas";
import { NewsTicker } from "../citizen/NewsTicker";
import { TopBar } from "../citizen/TopBar";
import { ReportFAB } from "../citizen/ReportFAB";
import { ReportSheet } from "../citizen/ReportSheet";
import { MyReportsSheet } from "../citizen/MyReportsSheet";
import { WorkSegmentPeek } from "../citizen/WorkSegmentPeek";
import { HazardPeek } from "../citizen/HazardPeek";
import { Toast } from "../citizen/Toast";
import { CITY_CENTER, HAZARDS, MY_REPORTS, NEWS, WORK_SEGMENTS } from "../citizen/data";
import type { Hazard, MyReport, UserLocation, WorkSegment } from "../citizen/types";
import { flyTo } from "../citizen/mapBridge";

export function MapPage() {
  const [hazards, setHazards] = useState<Hazard[]>(HAZARDS);
  const [workSegments] = useState<WorkSegment[]>(WORK_SEGMENTS);
  const [activeSegment, setActiveSegment] = useState<WorkSegment | null>(null);
  const [reports, setReports] = useState<MyReport[]>(MY_REPORTS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [userLoc, setUserLoc] = useState<UserLocation>({
    lng: CITY_CENTER[0] - 0.003,
    lat: CITY_CENTER[1] - 0.002,
  });
  const [toast, setToast] = useState<string | null>(null);
  const [hazardPeek, setHazardPeek] = useState<Hazard | null>(null);

  const handleLocate = () => {
    setLocating(true);
    setTimeout(() => {
      const next: UserLocation = {
        lng: CITY_CENTER[0] + (Math.random() - 0.5) * 0.004,
        lat: CITY_CENTER[1] + (Math.random() - 0.5) * 0.004,
      };
      setUserLoc(next);
      flyTo(next.lng, next.lat, 15.6);
      setLocating(false);
    }, 700);
  };

  const handleSubmitReport = (r: MyReport) => {
    setReports((prev) => [{ ...r }, ...prev]);
    if (r.loc) {
      setHazards((prev) => [
        {
          id: r.id,
          type: r.type,
          lng: r.loc!.lng,
          lat: r.loc!.lat,
          note: r.note || "Upravo prijavljeno",
          reportedBy: "you",
          minsAgo: 0,
        },
        ...prev,
      ]);
    }
    setToast("Prijava poslata · obaveštena je gradska ekipa");
  };

  const focusReport = (r: MyReport) => {
    const match = hazards.find((h) => h.id === r.id);
    if (match) flyTo(match.lng, match.lat, 16.4);
    setReportsOpen(false);
  };

  return (
    <div className="citizen-root relative -m-6 h-[calc(100vh-4rem)] overflow-hidden bg-ink-50">
      <MapCanvas
        hazards={hazards}
        workSegments={workSegments}
        userLocation={userLoc}
        pendingLocation={null}
        onHazardClick={(h) => {
          setHazardPeek(h);
          setActiveSegment(null);
          flyTo(h.lng, h.lat, 16.2);
        }}
        onSegmentClick={(id) => {
          const s = workSegments.find((x) => x.id === id);
          if (!s) return;
          setActiveSegment(s);
          setHazardPeek(null);
          const mid = s.coords[Math.floor(s.coords.length / 2)];
          flyTo(mid[0], mid[1], 15.8);
        }}
      />

      <NewsTicker items={NEWS} />

      <TopBar
        onOpenReports={() => setReportsOpen(true)}
        onLocate={handleLocate}
        onLayers={() => setToast("Slojevi mape stižu uskoro")}
        locating={locating}
        reportsBadge={reports.length}
      />

      {hazardPeek && <HazardPeek hazard={hazardPeek} onClose={() => setHazardPeek(null)} />}

      {activeSegment && (
        <WorkSegmentPeek segment={activeSegment} onClose={() => setActiveSegment(null)} />
      )}

      <ReportFAB onClick={() => setSheetOpen(true)} />

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

      <Toast toast={toast} onDone={() => setToast(null)} />
    </div>
  );
}
