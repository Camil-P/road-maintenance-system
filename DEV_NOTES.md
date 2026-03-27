# Road Maintenance System – Dev Notes

## 1. System description (goal)

This project is an **information system for road infrastructure maintenance and traffic signage**, built with **ASP.NET Core (.NET 10)** and **React**.

There is **no interactive map in v1**.  
Locations are stored as GPS coordinates and textual descriptions, and displayed through forms, lists, and tables.

The system supports four roles:

- **Driver** (citizen): reports road issues (potholes, ice, broken traffic lights, fallen signs, etc.).
- **FieldWorker**: sees assigned work orders and updates their status.
- **Dispatcher**: reviews incident reports, verifies them, and creates work orders.
- **MaintenanceManager**: monitors infrastructure status, resources, costs, and analytics.

Future versions may add a real map (Leaflet, Google Maps, etc.).  
The domain and APIs are designed so that a **map/GIS layer can be plugged in later** via an isolated location service.

My priorities for this project:

- Practice **architecture** (Domain + Infrastructure + vertical slices).
- Apply **SOLID** principles in real code.
- Use **Microsoft Identity** for authentication and authorization.
- Keep the **frontend simple but decent-looking** (React + shadcn/ui + TanStack Query).

---

## 2. High-level functionality (no map in v1)

### 2.1 Users, accounts, roles

We use **ASP.NET Core Identity** + **JWT**.

Roles:

- `Driver` – register, log in, create incident reports, see own reports.
- `FieldWorker` – see assigned work orders, update status.
- `Dispatcher` – see all incidents, verify them, create work orders.
- `MaintenanceManager` – see work orders, resources, and reports.

### 2.2 Roads and infrastructure assets

Entities:

- `RoadSegment`
  - Id, name, category (highway, main road, local road),
  - status (open, works in progress, closed, dangerous),
  - length in km, description.

- `InfrastructureAsset`
  - Type (bridge, traffic light, sign, horizontal marking),
  - GPS coordinates (latitude, longitude),
  - textual location description,
  - construction year, contractor warranty,
  - optional reference to a `RoadSegment`.

UI is table-based: lists and detail views.  
No visual map in v1, but we keep location data ready for future map integration.

### 2.3 Incident reporting and workflow

Drivers create **incident reports**:

- problem type (pothole, ice, traffic light issue, sign issue, etc.),
- description,
- optional GPS coordinates and/or selected `RoadSegment`,
- timestamp, user reference.

We need **duplicate detection**:

- if a similar incident (same problem type, close location) exists within a recent time window,
- the system should detect it and either mark it as duplicate or relate it to the existing incident.

Status flow for an incident:

- `Reported` → `Verified` → `WorkOrderIssued` → `Resolved`.

Dispatchers verify incidents and create work orders when needed.

### 2.4 Work orders and maintenance planning

Work orders are created by Dispatchers / Maintenance Managers:

- Link to an `IncidentReport` or directly to a `RoadSegment`.
- Work type (pothole repair, repainting lines, snow removal, traffic light fix, sign replacement, etc.).
- Status (Created, Scheduled, InProgress, Completed).

Priority calculation:

- Based on road category (highway > main road > local),
- and incident type (safety-critical issues get higher priority).

Field workers see their assigned work orders and update their status.

### 2.5 Resources, costs, and machines

We track:

- `MaterialStock`
  - asphalt (tons),
  - paint (liters),
  - salt (kg),
  - replacement signs (count).

- `Machine`
  - trucks, rollers, etc.,
  - basic data + simple amortization model.

The system links resource consumption to work orders and allows computing **cost per kilometer** for a road segment (simple formula is enough).

### 2.6 Reporting and analytics (no map UI)

We want simple JSON-based reports:

- **Hotspots**:
  - top segments or GPS clusters with the highest number of incidents.
- **Average response time**:
  - from incident reported → work order completed,
  - grouped by road category and problem type.
- **Budget overview**:
  - regular vs. emergency maintenance costs (aggregated).

All reports are exposed as API endpoints returning JSON.  
The frontend shows them as tables and numeric indicators (no heatmap in v1).

---

## 3. Solution structure and projects

Root folder (monorepo):

```txt
road-maintenance-system/
  server/             # .NET backend
  client/             # React frontend
  README.md
  DEV_NOTES.md
