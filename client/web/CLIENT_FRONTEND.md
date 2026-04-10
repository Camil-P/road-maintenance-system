# Road Maintenance System – Frontend (client/) Overview

React + TypeScript SPA for a Road Maintenance System, talking to a .NET 10 backend via REST under `/api`.  
Main entities: Users (roles), Incidents, Work Orders, Road Segments, and basic reporting (future phases).

## Tech Stack

- Build tooling: Vite + TypeScript + React 19
- UI: Tailwind CSS v4, shadcn/ui–style components (custom wrappers in `src/components/ui`)
- State / data fetching: TanStack Query v5 (`@tanstack/react-query`)
- Routing: React Router (`react-router-dom`)
- HTTP: Axios wrapper in `src/api/httpClient.ts` with base URL + JWT auth header
- Auth: email/password, JWT stored in `localStorage` (`rms_token` + `rms_user`)

## Folder Structure (high level)

```text
src/
  api/                # API client functions + TanStack Query hooks
  components/
    layout/           # App shell components (layout, sidebar, header)
    ui/               # Reusable UI components (button, input, table, dialog, etc.)
  features/
    auth/             # Login & Register pages + forms
    dashboard/        # Role-based dashboard pages
    incidents/        # Incident pages + table + form
    workOrders/       # Work order pages + table + form
  lib/                # Auth utilities, queryClient, helpers
  styles/             # Tailwind globals
  routing.tsx         # React Router configuration
  main.tsx            # App entry (QueryClientProvider + RouterProvider)
  App.tsx             # Mostly empty placeholder
```

The structure is **feature-based**: each domain (auth, incidents, work orders, dashboard) has its own `pages/` and `components/` folders.

## Core Infrastructure

### main.tsx & Query Client

- Creates a single `QueryClient` (from `@tanstack/react-query`) in `lib/queryClient.ts`.
- Wraps the app with `QueryClientProvider` and `RouterProvider` (React Router).
- Imports `styles/globals.css` to activate Tailwind.

### Tailwind CSS / shadcn-style UI

- Tailwind v4 configured with `@tailwindcss/vite` plugin.
- `globals.css` defines base Tailwind layers and shadcn-style theme tokens (colors, radii, etc.).
- `src/lib/utils.ts` exports `cn` helper for className merging.
- UI components under `src/components/ui/`:
  - `button.tsx`
  - `input.tsx`
  - `card.tsx`
  - `table.tsx`
  - `dialog.tsx`
  - `badge.tsx`
  - `textarea.tsx`
  - `select.tsx` (native `<select>` styled with Tailwind)
  - plus any other standard shadcn-like primitives.
- All feature components use these UI primitives instead of raw HTML where possible.

## Auth Layer

### Types & Storage

`src/lib/auth.ts`:

- `type UserRole = "Driver" | "FieldWorker" | "Dispatcher" | "MaintenanceManager"`.
- `interface CurrentUser { id: string; email: string; role: UserRole; }`.
- Token and user are stored in `localStorage`:
  - token key: `"rms_token"`
  - user key: `"rms_user"`
- Helper functions:
  - `saveAuth({ token, user })` – saves token + user JSON to localStorage.
  - `clearAuth()` – removes auth data.
  - `getCurrentUser(): CurrentUser | null` – reads and parses `rms_user`.
  - `isAuthenticated(): boolean` – checks for presence of token.
- Hook:
  - `useCurrentUser()` – reads current user (via `getCurrentUser()`) and exposes `{ user }`.

### HTTP Client

`src/api/httpClient.ts`:

- Axios instance with:
  - `baseURL` pointing to backend (e.g. `http://localhost:5000` or similar).
  - `Authorization: Bearer <token>` header automatically added if `rms_token` exists.
- Used by all `api/*` modules for network requests.

### Auth API Hooks

`src/api/auth.ts`:

- `useLoginMutation()` – `POST /api/auth/login` with `{ email, password }`.
  - On success: calls `saveAuth`, invalidates related queries, navigates to `/dashboard`.
- `useRegisterMutation()` – `POST /api/auth/register` with `{ email, password, fullName? }`.
  - Registers a user as default `Driver`, then logs them in or redirects to login.

### Auth Pages / Forms

`src/features/auth/pages/`:

- `LoginPage.tsx` – centers a `LoginForm` card.
- `RegisterPage.tsx` – centers a `RegisterForm` card.

`src/features/auth/components/`:

- `LoginForm.tsx`:
  - Fields: email, password (shadcn `Input`), submit `Button`.
  - Uses `useLoginMutation`.
  - Shows loading state and error message if login fails.
- `RegisterForm.tsx`:
  - Fields: email, password, confirm password (and optional full name).
  - Uses `useRegisterMutation`.
  - Basic client-side validation (e.g., matching passwords), then calls backend.

## Layout & Navigation

### AppLayout

`src/components/layout/AppLayout.tsx`:

- Renders the common shell: header + sidebar + main content.
- Layout roughly:
  ```tsx
  <div className="min-h-screen flex flex-col">
    <Header />
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  </div>
  ```

### Header

`src/components/layout/Header.tsx`:

- Shows app title (“Road Maintenance System”).
- Displays current user email and role (if logged in).
- Provides “Logout” button which calls `clearAuth()` and redirects to `/login`.

### Sidebar

`src/components/layout/Sidebar.tsx`:

- Uses `NavLink` from `react-router-dom`.
- Uses `useCurrentUser()` to decide which links to show per role.
- Shared helper:
  ```tsx
  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded px-3 py-2 hover:bg-slate-100 text-sm ${
      isActive ? "bg-slate-100 font-medium" : ""
    }`;
  ```
- Links:
  - Always:
    - `/dashboard` – generic “Dashboard” entry (internally role-based).
  - Driver (`role === "Driver"`):
    - `/incidents/my` – “My incidents”
    - `/incidents/new` – “Report incident”
  - Dispatcher / MaintenanceManager:
    - `/incidents` – “All incidents”
    - `/workorders` – “Work orders”
  - FieldWorker:
    - `/my-workorders` – “My work orders”

## Routing

`src/routing.tsx`:

- Uses `createBrowserRouter` + `RouterProvider`.
- `RequireAuth` component:
  - If `!isAuthenticated()` → `<Navigate to="/login" replace />`.
  - Else wraps children in `<AppLayout><Outlet /></AppLayout>`.
- `DashboardRedirect`:
  - Reads user via `getCurrentUser()`.
  - Redirects `/` (and effectively `/dashboard`) to role-specific dashboard:
    - Driver → `/dashboard/driver`
    - FieldWorker → `/dashboard/fieldworker`
    - Dispatcher → `/dashboard/dispatcher`
    - MaintenanceManager → `/dashboard/manager`

Routes:

- Public:
  - `/login` → `LoginPage`
  - `/register` → `RegisterPage`
- Protected (wrapped in `RequireAuth`):
  - `/` → `DashboardRedirect`
  - `/dashboard` → fallback (Driver dashboard)
  - `/dashboard/driver` → `DriverDashboardPage`
  - `/dashboard/dispatcher` → `DispatcherDashboardPage`
  - `/dashboard/fieldworker` → `FieldWorkerDashboardPage`
  - `/dashboard/manager` → `ManagerDashboardPage`
  - Driver:
    - `/incidents/my` → `MyIncidentsPage`
    - `/incidents/new` → `CreateIncidentPage`
  - Dispatcher / Manager:
    - `/incidents` → `IncidentsListPage`
    - `/workorders` → `WorkOrdersListPage`
  - FieldWorker:
    - `/my-workorders` → `MyWorkOrdersPage`
- Fallback:
  - `*` → redirect to `/`.

## Dashboards

### DriverDashboardPage

`src/features/dashboard/pages/DriverDashboardPage.tsx`:

- Simple intro + cards:
  - “My Incidents” card → button linking to `/incidents/my`.
  - “Report New” card → button linking to `/incidents/new`.

### DispatcherDashboardPage

- Shows cards for:
  - “All Incidents” → `/incidents`
  - “Work Orders” → `/workorders`
- Text: manage incidents and work orders.

### FieldWorkerDashboardPage

- Focused on assigned work orders:
  - Card “My Work Orders” → `/my-workorders`.

### ManagerDashboardPage

- Overview:
  - “All Incidents” → `/incidents`
  - “Work Orders” → `/workorders`
- Designed to extend later with reporting / analytics cards.

## Incidents Feature

### Types & API

`src/api/incidents.ts` (simplified):

- `type IncidentStatus = "Reported" | "Verified" | "Rejected" | "Resolved"`.
- `interface Incident`:
  - `id`, `incidentType`, `description`, `status`, `createdAt`
  - optional `roadSegmentId`, `latitude`, `longitude`.
- Queries:
  - `useMyIncidentsQuery()` → `GET /api/incidents/my`
  - `useIncidentsQuery(filters)` → `GET /api/incidents?status=&type=&roadSegmentId=&fromDate=&toDate=`
- Mutations:
  - `useCreateIncidentMutation()` → `POST /api/incidents`
  - `useVerifyIncidentMutation()` → `PATCH /api/incidents/{id}/verify`
- Query keys follow `["incidents", ...]`, and mutations invalidate the relevant lists.

### Pages

`src/features/incidents/pages/`:

- `MyIncidentsPage.tsx`:
  - Uses `useMyIncidentsQuery()`.
  - Renders `IncidentTable` with driver’s incidents.
- `CreateIncidentPage.tsx`:
  - Shows `IncidentForm`.
  - On success, redirects to `/incidents/my` and invalidates `["incidents"]` queries.
- `IncidentsListPage.tsx`:
  - For Dispatcher / Manager.
  - Uses filters (status, type).
  - Uses `useIncidentsQuery(filters)` and `IncidentTable`.
  - Supports verifying incidents via `useVerifyIncidentMutation()`.

### Components

#### IncidentForm

`src/features/incidents/components/IncidentForm.tsx`:

- Fields:
  - `incidentType` (select or text input; enum strings like “Pothole”, “Debris”, etc.)
  - `description` (textarea)
  - optional: `roadSegmentId` (select), `latitude`, `longitude`
- Uses shadcn `Input`, `Textarea`, and styled `<select>`.
- On submit:
  - Calls `useCreateIncidentMutation`.
  - Handles loading and error states.
  - Success handler passed from page (e.g. navigate + toast).

#### IncidentTable

`src/features/incidents/components/IncidentTable.tsx`:

- Uses shadcn `Table` components (`Table`, `TableHead`, `TableRow`, etc.).
- Columns include:
  - ID
  - Type
  - Status
  - Description
  - Road segment (if available)
  - Created/Reported at (formatted date)
  - Verify button (for Dispatcher/Manager) using `useVerifyIncidentMutation`.
  - “Work Order” column:
    - Renders `<IncidentCreateWOButton incidentId={row.original.id} />` to open WO dialog.
- Shows loading indicator if query is loading and empty state if no incidents.

#### IncidentCreateWOButton

`src/features/incidents/components/IncidentCreateWOButton.tsx`:

- A small helper to create work orders from incidents.
- Renders:
  - `Dialog` with trigger button (“Create WO”).
  - Inside dialog: `WorkOrderForm` pre-filled with `incidentId`.
- Props:
  - `incidentId: string`.
- Props passed to `WorkOrderForm`:
  - `incidentId`
  - `onClose={() => setOpen(false)}`.

## Work Orders Feature

### Types & API

`src/api/workOrders.ts`:

- `type WorkOrderStatus = "Created" | "InProgress" | "Completed" | "Cancelled"`.
- `type WorkType = "Repair" | "Maintenance" | "Inspection" | "Emergency"`.
- `interface WorkOrder`:
  - `id`, `workType`, `status`, `priority`, `createdAt`
  - optional: `incidentId`, `roadSegmentId`, `assignedToUserId`, `scheduledDate`.
- Functions:
  - `fetchWorkOrders(filters)` → `GET /api/workorders` with optional `status`, `roadSegmentId`, `assignedToUserId`.
  - `fetchMyWorkOrders()` → `GET /api/workorders/my` (or filtered equivalent).
  - `createWorkOrder(payload)` → `POST /api/workorders`.
  - `updateWorkOrderStatus(id, status)` → `PATCH /api/workorders/{id}/status`.
- Hooks:
  - `useWorkOrdersQuery(filters?)` – for Dispatcher/Manager all work orders.
  - `useMyWorkOrdersQuery()` – for FieldWorker assigned work orders.
  - `useCreateWorkOrderMutation()` – invalidates `["workOrders"]` and `["incidents"]` on success.
  - `useUpdateWorkOrderStatusMutation()` – invalidates `["workOrders"]` and updates local cache.

### Road Segments API

`src/api/roadSegments.ts`:

- `interface RoadSegment { id; name; category; status; length; }`.
- `fetchRoadSegments()` → `GET /api/roadsegments`.
- `useRoadSegmentsQuery()` – used by `WorkOrderForm` for dropdown.

### Pages

`src/features/workOrders/pages/`:

- `WorkOrdersListPage.tsx`:
  - For Dispatcher/Manager.
  - Uses `WorkOrderTable` with `assignedOnly={false}`.
- `MyWorkOrdersPage.tsx`:
  - For FieldWorker.
  - Uses `WorkOrderTable` with `assignedOnly={true}`.

### Components

#### WorkOrderTable

`src/features/workOrders/components/WorkOrderTable.tsx`:

- Uses `Table` from `components/ui/table`.
- Props:
  - `assignedOnly?: boolean` (default `false`).
- Logic:
  - If `assignedOnly` → uses `useMyWorkOrdersQuery()`.
  - Else → uses `useWorkOrdersQuery()`.
- Renders:
  - Title “All work orders” or “My work orders”.
  - For Dispatcher/Manager (non-`assignedOnly`):
    - “New work order” button opening a `Dialog` with `WorkOrderForm`.
  - Table columns:
    - ID
    - Type
    - Status (as `Badge`)
    - Priority
    - AssignedTo
    - Actions:
      - `Start` (Created → InProgress) using `useUpdateWorkOrderStatusMutation`.
      - `Complete` (InProgress → Completed).
- Handles loading (spinner) and empty-state messages.

#### WorkOrderForm

`src/features/workOrders/components/WorkOrderForm.tsx`:

- Props:
  - `incidentId?: string` (if launched from an incident).
  - `onClose: () => void` (called on success or Cancel).
- Local state: `workType`, `roadSegmentId`, `scheduledDate`.
- Fields:
  - Work Type (required): native `<select>` with options: Repair, Maintenance, Inspection, Emergency.
  - Road Segment (optional): `<select>` populated from `useRoadSegmentsQuery()`.
  - Scheduled Date (optional): `<input type="date">`.
- On submit:
  - If `workType` missing → do nothing (basic validation).
  - Calls `useCreateWorkOrderMutation` with payload `{ incidentId?, workType, roadSegmentId?, scheduledDate? }`.
  - On success: calls `onClose` (dialog closes).
- Shows error message if mutation fails.

## What’s Working Today (End-to-End)

- **Auth**:
  - Register as Driver.
  - Login, token + user stored in localStorage.
  - App routes protected behind `RequireAuth`.
- **Role-based shell**:
  - Sidebar links change by role.
  - `/dashboard` redirects to role-specific dashboard.
- **Incidents**:
  - Driver:
    - Can report incidents (`/incidents/new`).
    - Can view **My incidents** (`/incidents/my`).
  - Dispatcher/Manager:
    - View all incidents (`/incidents`) with filters.
    - Verify incidents (status changes propagate).
    - Create work orders directly from incidents via `IncidentCreateWOButton`.
- **Work Orders**:
  - Dispatcher/Manager:
    - View all work orders (`/workorders`).
    - Create new work order (from list or incident).
  - FieldWorker:
    - View assigned work orders (`/my-workorders`).
    - Update status (Created → InProgress → Completed).
- **General UX**:
  - Loading states handled via TanStack Query.
  - Basic error display in forms.
  - Layout consistent with Tailwind + shadcn-style components.

## Guidelines for Future AI Enhancements

When extending this frontend, please:

1. **Follow feature-based structure**:  
   - New domain → `src/features/<name>/pages` + `components` + `api/<name>.ts`.
2. **Always wrap backend calls in `api/*` + TanStack Query hooks**:  
   - Plain axios in `api/*.ts`, then `useQuery` / `useMutation` exported hooks.
3. **Use existing UI primitives**:  
   - Import from `@/components/ui/*` (button, input, table, dialog, badge, textarea, select).
4. **Respect auth & roles**:  
   - Use `getCurrentUser()` / `useCurrentUser()` and `isAuthenticated()` to gate routes and actions.
   - When adding new routes, update `routing.tsx` and Sidebar logic.
5. **Keep UX consistent**:  
   - Show loading spinners for long queries.
   - Show error messages near forms/tables.
   - Disable buttons while mutations are pending.
6. **For new backend endpoints** (resources, reporting, assets, etc.):
   - Create `api/<feature>.ts` with types + fetch functions + hooks.
   - Add feature pages under `src/features/<feature>/pages`.
   - Add navigation entries on relevant dashboards and in the Sidebar if needed.

This summary reflects the current implementation and conventions of the **client** app and should be used as context when implementing new phases (resources, reporting, UX polish) and when refactoring existing components.