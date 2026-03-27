# Frontend Implementation Plan - Road Maintenance System

**Verzija**: 1.0  
**Datum**: Mart 2026  
**Status**: Spreman za razvoj (svi backend endpoint-i implementirani)

---

## 📋 Pregled

Backend je sada kompletan sa 21 novim endpoint-om distribuiranim kroz 5 featura:
- **Auth Admin** (4 endpoint-a)
- **Incident Workflow** (3 endpoint-a)
- **Materials Management** (6 endpoint-a)
- **Machines Management** (6 endpoint-a)
- **Analytics** (2 endpoint-a)

Ovaj plan definiše sve potrebne UI komponente, forme, stranice i integracije za frontend.

---

## 🎯 Faza 1: Auth & User Management (1-2 nedelje)

### Prioritet: CRITICAL ✓
Backend dependencija: Gotov (4 endpoint-a)

### 1.1 Admin Staff Registration Modal/Page
**Routes**: `POST /api/auth/admin/register`

**Komponente za kreiranje**:
- [ ] `AdminRegistrationForm` komponenta
  - Polja: Email, Password, FirstName, LastName, Role dropdown (FieldWorker/Dispatcher/MaintenanceManager)
  - Validacija: Email format, 8+ karaktera password, required fields
  - Success toast: "Zaposlenik dodan u sistem"
  - Error handling: Prikaži backend error poruku

- [ ] Role selector radio/dropdown sa ikonama za svaku rolu

**Integracijska mesta**:
- Dodaj u Admin Dashboard → "Add Staff" dugme
- Ili kao dedicated stranica: `/admin/staff-management`

**API Integration snippet**:
```typescript
async registerStaff(request: AdminRegisterRequest) {
  return api.post('/auth/admin/register', request);
}
```

---

### 1.2 User Profile Update Form
**Routes**: `PUT /api/auth/me/profile`

**Komponente za kreiranje**:
- [ ] `EditProfileModal` komponenta
  - Polja: FirstName, LastName (samo ta dva)
  - Prepopulate sa trenutnim vrednostima iz `/auth/me`
  - Submit: "Save Changes"
  - Success: Osveži user state u Redux/Context, reload navbar

**Integracijska mesta**:
- User menu (gornji desni ugao) → "Edit Profile"
- Ili settings stranica: `/settings/profile`

---

### 1.3 User Active/Inactive Toggle (Admin)
**Routes**: `PATCH /api/auth/users/{userId}/active`

**Komponente za kreiranje**:
- [ ] `UserStatusToggle` komponenta (inline switch sa confirm dialog)
- [ ] User list sa toggle-om u Admin Dashboard
  - Prikaži sve korisnike sa njihovim uloga i statusom (Active/Inactive)
  - Filter: By role, by status
  - Bulk actions: Activate/Deactivate multiple users

**Integracijska mesta**:
- Admin staff management stranica
- User table sa akcija kolona

---

### 1.4 Assign Role to User (Admin)
**Routes**: `PATCH /api/auth/users/{userId}/role`

**Komponente za kreiranje**:
- [ ] `AssignRoleModal` komponenta
  - Dropdown sa dozvoljenim ulogama
  - Pokaži trenutnu rolu pre nego što promeni
  - Confirm pre nego što sačuva
  - Success: "Uloga dodeljena korisn iku"

**Integracijska mesta**:
- User list → Akcija "Change Role"
- Ili kao inline edit u admin table-u

---

## 🛣️ Faza 2: Incident Workflow Enhancement (2-3 nedelje)

### Prioritet: CRITICAL ✓
Backend dependencija: Gotov (3 endpoint-a + configurable dedup)

### 2.1 Incident Verification Workflow
**Routes**: `PATCH /api/incidents/{id}/verify`

**Komponente za kreiranje**:
- [ ] Incident detail view update
  - Dodaj "Verify" dugme (vidljivo samo ako status = Reported, za Dispatcher/MaintenanceManager)
  - Click → bez dodatnog dialoga, direktno verifikuj
  - Prikaži confirmed toast: "Incident provereno. Status: Verified"
  - Auto-refresh incident status

- [ ] Status badge update
  - Color coding: Reported (yellow) → Verified (blue) → WorkOrderIssued (orange) → Resolved (green)

**Integracijska mesta**:
- Incident detail stranica
- Incident list → Bulk action "Verify Selected"

---

### 2.2 Incident Resolution Workflow
**Routes**: `PATCH /api/incidents/{id}/resolve`

**Komponente za kreiranje**:
- [ ] ResolutionDialog komponenta
  - Pitaj za optional "Resolution Notes"
  - Prikaži information: "Rešavanje će označiti incident kao završen"
  - Confirm dugme sa loading state
  
- [ ] Show resolution timestamp i details u incident view

**Integracijska mesta**:
- Incident detail → "Resolve" button (vidljivo ako status = Verified/WorkOrderIssued)
- Incident list → Bulk actions

---

### 2.3 Mark Incident as Duplicate
**Routes**: `PATCH /api/incidents/{id}/mark-duplicate/{relatedIncidentId}`

**Komponente za kreiranje**:
- [ ] `DuplicateIncidentModal` komponenta
  - Incident picker/search: "Pronađi originalni incident"
  - Auto-load lista sličnih (geografski blizu + po vremenu u poslednjih 24h ili konfigurabilno)
  - Prikaži: incident ID, lokacija, tip, vreme
  - Select → "Mark as Duplicate" dugme
  
- [ ] Duplicate badge na incident detail-u
  - "This incident is a duplicate of #XXXXX" sa linkom

**Integracijska mesta**:
- Incident detail → "Mark as Duplicate" action
- Incident list → Bulk action

---

### 2.4 Configurable Duplicate Detection (UI)
**Routes**: Dashboard setting ili Admin page (ne direktno backend, ali prikazi trenutne vrednosti)

**Komponente za kreiranje**:
- [ ] Admin Settings page (ili modal) za incident dedup config
  - Display current settings: RadiusMeters, TimeWindowHours (read-only za sada, ili editable sa backend update)
  - Prikaži help text: "Incidents unutar X meteara i Y sati se smatraju potencijalnim duplikatima"

---

## 📦 Faza 3: Materials Management (2 nedelje)

### Prioritet: HIGH
Backend dependencija: Gotov (6 endpoint-a)

### 3.1 Materials Inventory List
**Routes**: `GET /api/materials`, `GET /api/materials/{id}`

**Komponente za kreiranje**:
- [ ] `MaterialsList` stranica
  - Table sa kolonama: Material Name, Unit, Current Qty, Min Threshold, Unit Cost, Total Value, Status (Below Threshold ikonica)
  - Sortable po svakoj koloni
  - Filter: By unit type, by status (below threshold yes/no)
  - Search: Po imenu
  - Actions: Edit, Delete, "Add Stock", "Consume"

- [ ] Material detail modal/page
  - Prikazi sve polja + LastUpdated timestamp
  - Poruka ako je below threshold: "⚠️ Below minimum threshold - consider restocking"

---

### 3.2 Create Material Dialog
**Routes**: `POST /api/materials`

**Komponente za kreiranje**:
- [ ] `CreateMaterialForm` modal
  - Polja:
    - Material Name* (text)
    - Unit* (dropdown: kg, L, m, pieces, hours, itd.)
    - Current Quantity* (number, default 0)
    - Minimum Threshold* (number >= 0)
    - Unit Cost* (decimal, ≥ 0.01)
  - Validacija: Backend ce holovati, ali dodaj client-side za UX
  - Success: Refresh materials list, close modal

- [ ] Launch button: "+ Add Material" u toolbar

---

### 3.3 Edit Material Dialog
**Routes**: `PUT /api/materials/{id}`

**Komponente za kreiranje**:
- [ ] `EditMaterialForm` modal (prepopulate sa trenutnim vrednostima)
  - Ista polja kao create, minus CurrentQuantity (ne menja se через update)
  - Save & cancel dugmići

---

### 3.4 Add Stock Operation
**Routes**: `PATCH /api/materials/{id}/stock/add`

**Komponente za kreiranje**:
- [ ] `AddStockDialog` modal
  - Polje: Quantity to add (number > 0)
  - Optional datepicker: Datum kupovine/prijema
  - Confirmation: "Dodaj X {unit} u inventar za {material_name}"
  - Success: Osveži list, prikaži toast sa novim stanjem

---

### 3.5 Consume Stock Operation (with Work Order Linking)
**Routes**: `PATCH /api/materials/{id}/stock/consume`

**Komponente za kreiranje**:
- [ ] `ConsumeStockDialog` modal
  - Polje: Quantity to consume (max = current qty)
  - **Kritično: Work Order picker**
    - Dropdown/search za aktivne work orders
    - Optional izbor
    - Ako izabran: automatski inckermentuj `WorkOrder.ActualCost += qty * unitCost`
  - Show: "Potrosnja će smanjiti inventar sa X na Y {unit}"
  - Prikaži warning ako se ide ispod minimum threshold-a

- [ ] Toast sa info: "Stock consumed + Work Order #123 cost updated to $500.00"

**Integracijska mesta**:
- Materials list → Actions → "Consume"
- Work Order detail → "Add Material" tab/modal (alternate flow)

---

## 🏗️ Faza 4: Machines Management (2 nedelje)

### Prioritet: HIGH
Backend dependencija: Gotov (6 endpoint-a)

### 4.1 Machines Inventory List
**Routes**: `GET /api/machines`, `GET /api/machines/{id}`

**Komponente za kreiranje**:
- [ ] `MachinesList` stranica
  - Table sa kolonama:
    - Machine Name
    - Type (escavator, roller, truck, itd.)
    - Acquisition Year
    - Current Book Value (auto-calculated)
    - IsOperational (status badge: ✓ Operating / ⚠️ Maintenance / ✗ Out of Service)
    - Last Maintenance Date
    - Actions: Edit, View Details, Operational, Record Maintenance

- [ ] Machine detail view
  - Prikazi sve polja: Name, Type, Serial/Registration, Acquisition/Purchase info
  - Depreciation calc: Annual Depreciation (PurchasePrice - ResidualValue) / UsefulLifeYears
  - Book Value: Depreciation * Years in service
  - Operational status indicator sa razlogom
  - Last maintenance timestamp
  - Notes history (akumulirane iz Record Maintenance)

---

### 4.2 Create Machine Dialog
**Routes**: `POST /api/machines`

**Komponente za kreiranje**:
- [ ] `CreateMachineForm` modal
  - Polja:
    - Machine Name* (text)
    - Machine Type* (dropdown ili autocomplete)
    - Acquisition Year* (year picker)
    - Purchase Price* (decimal > 0)
    - Useful Life (Years)* (number 1-50)
    - Residual Value* (decimal ≥ 0, max = purchase price)
    - Registration Number (optional)
    - Notes (optional textarea)
  - Validation: C ala na frontend, backend će validirati

---

### 4.3 Edit Machine Dialog
**Routes**: `PUT /api/machines/{id}`

**Komponente**: `EditMachineForm` modal (identično Create-u)

---

### 4.4 Set Machine Operational Status
**Routes**: `PATCH /api/machines/{id}/operational`

**Komponente za kreiranje**:
- [ ] `SetMachineOperationalDialog` modal
  - Toggle: Operating ↔ Not Operating (sa branching logic)
  - Ako Operating: potvrdi "Put machine back in operation"
  - Ako Not Operating: reason dropdown/text
    - Options: "Scheduled Maintenance", "Repair Needed", "Out of Service", "Custom Reason"
    - Show textarea ako je "Custom Reason"
  - Success: Osveži machine detail view

**Integracijska mesta**:
- Machine list → Status column sa inline toggle
- Machine detail → "Change Operational Status" button

---

### 4.5 Record Maintenance
**Routes**: `PATCH /api/machines/{id}/maintenance`

**Komponente za kreiranje**:
- [ ] `RecordMaintenanceDialog` modal
  - Polja:
    - Maintenance Type (checkbox/tags): Oil change, Filter replacement, Hydraulic check, Tire rotation, Custom...
    - Notes* (textarea, required)
    - Optional datepicker: Datum održavanja (default = today)
  - Success: Prikaži "Maintenance recorded at {timestamp}"
  - Update machine detail sa novi Last Maintenance Date

**Integracijska mesta**:
- Machine detail → "Record Maintenance" button
- Machines list → Bulk action "Record Maintenance for Selected"

---

## 📊 Faza 5: Analytics & Dashboards (2-3 nedelje)

### Prioritet: MEDIUM-HIGH
Backend dependencija: Gotov (3 endpoint-a)

### 5.1 Incident Hotspots Map View
**Routes**: `GET /api/analytics/hotspots?fromDate=...&toDate=...`

**Komponente za kreiranje**:
- [ ] `HotspotsMap` stranica
  - Interactive mapa (Leaflet ili Mapbox)
  - Prikaži markers za svaki hotspot cluster
  - Marker color/size by incident count
  - Click marker → show:
    - Center coordinates
    - Number of incidents
    - Incident IDs sa linkovima
    - Date range (ako filtrirano)

- [ ] Filter sidebar:
  - Date range picker: From / To
  - Button: "Apply Filters"
  - Button: "Reset to Last 30 Days"
  - Info: "Hotspots are clustered within {configurable_radius}m"

- [ ] Export button: CSV ili GeoJSON za GIS analizu

**Integracijska mesta**:
- Main dashboard → Hotspots card sa link
- Dedicated Analytics → Hotspots tab

---

### 5.2 Response Time Analytics
**Routes**: `GET /api/analytics/response-time?fromDate=...&toDate=...`

**Komponente za kreiranje**:
- [ ] `ResponseTimeChart` komponenta
  - Chart tip: Histogram/Bar chart sa average response time u satima
  - X-axis: Time buckets (daily/weekly/monthly zavisno od date range)
  - Y-axis: Average hours to resolve
  - Prikaži:
    - Overall average hours
    - Min/Max incident resolution time
    - Trend indicator (↑ worse, ↓ better)
    - Number of resolved incidents u periodu

- [ ] Filter:
  - Date range picker
  - Optional: By incident type (filter down)

---

### 5.3 Budget Overview Analytics
**Routes**: `GET /api/analytics/budget-overview?fromDate=...&toDate=...`

**Komponente za kreiranje**:
- [ ] `BudgetOverviewWidget` stranica/card
  - Prikaži tri metrike side-by-side:
    1. Emergency expenses (red card): $X.XX
    2. Regular expenses (blue card): $X.XX
    3. Total cost (green card): $X.XX
  
  - Pie chart: Emergency vs Regular split
  - List ispod sa top 10 Work Orders by cost (sa linkom na detail)
  - Filter:
    - Date range picker
    - Status filter: Completed, In Progress, All

---

### 5.4 Unified Analytics Dashboard
**Komponente za kreiranje**:
- [ ] `AnalyticsDashboard` stranica
  - Tab 1: Hotspots (Mapa)
  - Tab 2: Response Time (Chart)
  - Tab 3: Budget (Cards + Pie)
  - Tab 4: Custom Reports (future expansion)
  - Centralizovani filter za sve tab-e (Date range)
  - Export entire dashboard: PDF ili jako strukturiran CSV

---

## 🔌 Faza 6: Services & State Management (Paralelno sa svim fazama)

### Prioritet: CRITICAL (Start U1)

### 6.1 API Service Layer
**Fajl**: `services/api/roadMaintenanceApi.ts`

**Método grupe**:
```typescript
// Auth Service
authService = {
  registerStaff: (req: AdminRegisterRequest) => post('/auth/admin/register', req),
  updateProfile: (req: UpdateProfileRequest) => put('/auth/me/profile', req),
  setUserActive: (userId: string, req: SetUserActiveRequest) => patch(`/auth/users/${userId}/active`, req),
  assignRole: (userId: string, req: AssignRoleRequest) => patch(`/auth/users/${userId}/role`, req),
}

// Incidents Service
incidentsService = {
  verify: (id: string) => patch(`/incidents/${id}/verify`),
  resolve: (id: string) => patch(`/incidents/${id}/resolve`),
  markDuplicate: (id: string, relatedId: string) => patch(`/incidents/${id}/mark-duplicate/${relatedId}`),
  // existing methods unchanged
}

// Materials Service (new)
materialsService = {
  getAll: () => get('/materials'),
  getById: (id: string) => get(`/materials/${id}`),
  create: (req: CreateMaterialRequest) => post('/materials', req),
  update: (id: string, req: UpdateMaterialRequest) => put(`/materials/${id}`, req),
  addStock: (id: string, req: AdjustMaterialStockRequest) => patch(`/materials/${id}/stock/add`, req),
  consumeStock: (id: string, req: AdjustMaterialStockRequest) => patch(`/materials/${id}/stock/consume`, req),
}

// Machines Service (new)
machinesService = {
  getAll: () => get('/machines'),
  getById: (id: string) => get(`/machines/${id}`),
  create: (req: CreateMachineRequest) => post('/machines', req),
  update: (id: string, req: UpdateMachineRequest) => put(`/machines/${id}`, req),
  setOperational: (id: string, req: SetMachineOperationalRequest) => patch(`/machines/${id}/operational`, req),
  recordMaintenance: (id: string, req: RecordMaintenanceRequest) => patch(`/machines/${id}/maintenance`, req),
}

// Analytics Service (new)
analyticsService = {
  getHotspots: (query?: HotspotQuery) => get('/analytics/hotspots', { params: query }),
  getResponseTime: (query?: AnalyticsPeriodQuery) => get('/analytics/response-time', { params: query }),
  getBudgetOverview: (query?: AnalyticsPeriodQuery) => get('/analytics/budget-overview', { params: query }),
}
```

---

### 6.2 Redux/Context Slices
**State shape**:
```typescript
// Materials slice
materials = {
  items: Material[],
  selectedId?: string,
  loading: boolean,
  error?: string,
}

// Machines slice
machines = {
  items: Machine[],
  selectedId?: string,
  loading: boolean,
  error?: string,
}

// Analytics slice
analytics = {
  hotspots: HotspotResponse[],
  responseTime: ResponseTimeSummaryResponse,
  budgetOverview: BudgetOverviewResponse,
  filters: { fromDate?: Date, toDate?: Date },
  loading: boolean,
}

// Incidents slice (extend existing)
// Dodaj: `duplicateCandidates: IncidentResponse[]` za duplicate detection UI
```

---

### 6.3 Custom Hooks
**Fajlovi za kreiranje**:
- [ ] `useMaterials()` — fetch all, create, update, delete
- [ ] `useMachines()` — fetch all, create, update, maintenance operations
- [ ] `useAnalytics()` — fetch hotspots, response-time, budget-overview sa filtering
- [ ] `useIncidentWorkflow()` — verify, resolve, markDuplicate helpers
- [ ] `useUserManagement()` — registerStaff, setActive, assignRole (admin-only)

---

## 📱 Faza 7: Navigation & Layout Updates

### 7.1 Sidebar Update
**Komponente za update**:
- [ ] Add new menu items:
  ```
  📦 Inventory Management
    ├─ Materials
    └─ Machines
  
  📊 Analytics
    ├─ Incident Hotspots
    ├─ Response Times
    └─ Budget Overview
  
  👥 Admin (novo)
    ├─ Staff Management
    └─ System Settings
  ```

---

### 7.2 Header/Navigation Bar
- [ ] Add user menu: "Edit Profile" option (umesto fiksnog profila)
- [ ] Add Admin badge ako je user admin

---

## 🧪 Faza 8: Testing & QA

### 8.1 Unit Tests (Per komponenta)
- [ ] Service layer tests (API mocking)
- [ ] Component prop/state tests (React Testing Library)
- [ ] Form validation tests

### 8.2 Integration Tests
- [ ] Complete workflow tests (Auth → Incident → WO → Material consume → Analytics)
- [ ] Error scenarios (400/401/403/500 responses)

### 8.3 E2E Tests (Cypress/Playwright)
- [ ] User journey: Login → Create incident → Verify → Create WO → Consume material → Check analytics

---

## 📅 Timeline & Feasibility

| Faza | Prioritet | Nedelje | Preduslov |
|------|-----------|---------|-----------|
| 1. Auth & Users | CRITICAL | 1-2 | API service layer |
| 2. Incident Workflow | CRITICAL | 1-2 | API service layer |
| 6. Services & State | CRITICAL | 2-3 | Paralelno sa fazama 1-2 |
| 3. Materials | HIGH | 2 | Faze 1, 6 |
| 4. Machines | HIGH | 2 | Faze 1, 6 |
| 5. Analytics | MEDIUM-HIGH | 2-3 | Faze 1, 6; Map library |
| 7. Navigation | LOW | 0.5 | Sve faze |
| 8. Testing | MEDIUM | 2-3 | Sve faze (paralelno) |
| **TOTAL** |  | **6-8 nedelja** | MVP ready |

---

## 🎬 MVP Minimal Viable Product (Nedelje 1-4)

**Šta je MINIMUM za MVP**:
1. ✓ Auth admin endpoints (register staff, roles, active/inactive)
2. ✓ Incident verify/resolve workflow
3. ✓ Materials: List, Create, Add stock, Consume (basic table)
4. ✓ Machines: List, Create, Record maintenance (basic table)
5. ✓ Analytics: Budget overview (card, no map)

**Ne broji u MVP**:
- Duplicate detection UI (config read-only)
- Hotspots interactive mapa (tablica umesto mape)
- Advanced filtering/bulk actions
- Comprehensive tests

**MVP Faza Redosled**:
1. API service layer + Redux setup (24h)
2. Auth admin forms (2-3 dana)
3. Incident workflow buttons (2 dana)
4. Materials basic CRUD + consume (3-4 dana)
5. Machines basic CRUD + maintenance (3-4 dana)
6. Analytics budget widget (1-2 dana)
7. Navigation updates (4 sata)

**MVP Sprint 1**: **2 nedelje (sa 4-hour buffer)**

---

## 🗂️ Preporučena Struktura direktorijuma Frontend-a

```
client/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── AdminRegistrationForm.tsx
│   │   │   ├── EditProfileModal.tsx
│   │   │   ├── AssignRoleModal.tsx
│   │   │   └── UserStatusToggle.tsx
│   │   ├── Incidents/
│   │   │   ├── IncidentList.tsx
│   │   │   ├── IncidentDetail.tsx
│   │   │   ├── VerifyIncidentButton.tsx
│   │   │   ├── ResolveIncidentDialog.tsx
│   │   │   └── MarkDuplicateModal.tsx
│   │   ├── Materials/
│   │   │   ├── MaterialsList.tsx
│   │   │   ├── CreateMaterialForm.tsx
│   │   │   ├── AddStockDialog.tsx
│   │   │   └── ConsumeStockDialog.tsx
│   │   ├── Machines/
│   │   │   ├── MachinesList.tsx
│   │   │   ├── CreateMachineForm.tsx
│   │   │   ├── SetOperationalDialog.tsx
│   │   │   └── RecordMaintenanceDialog.tsx
│   │   ├── Analytics/
│   │   │   ├── HotspotsMap.tsx
│   │   │   ├── ResponseTimeChart.tsx
│   │   │   ├── BudgetOverviewWidget.tsx
│   │   │   └── AnalyticsDashboard.tsx
│   │   ├── Layout/
│   │   │   ├── Sidebar.tsx (updated)
│   │   │   ├── Header.tsx (updated)
│   │   │   └── MainLayout.tsx
│   ├── services/
│   │   ├── api/
│   │   │   ├── roadMaintenanceApi.ts
│   │   │   └── client.ts (axios/fetch setup)
│   │   └── utils/
│   ├── store/
│   │   ├── slices/
│   │   │   ├── materialsSlice.ts
│   │   │   ├── machinesSlice.ts
│   │   │   ├── analyticsSlice.ts
│   │   │   └── incidentsSlice.ts (extended)
│   │   └── hooks/
│   │       ├── useMaterials.ts
│   │       ├── useMachines.ts
│   │       ├── useAnalytics.ts
│   │       ├── useIncidentWorkflow.ts
│   │       └── useUserManagement.ts
│   ├── pages/
│   │   ├── auth/
│   │   ├── admin/
│   │   │   ├── StaffManagement.tsx
│   │   │   └── SystemSettings.tsx
│   │   ├── materials/
│   │   │   └── MaterialsPage.tsx
│   │   ├── machines/
│   │   │   └── MachinesPage.tsx
│   │   ├── incidents/
│   │   │   └── IncidentsPage.tsx (extended)
│   │   └── analytics/
│   │       ├── HotspotsPage.tsx
│   │       ├── ResponseTimePage.tsx
│   │       └── BudgetOverviewPage.tsx
│   └── types/
│       ├── api.ts (all request/response types)
│       ├── domain.ts (entities)
│       └── forms.ts (form schemas)
```

---

## ✅ Checklist: Pre-Development

- [ ] Backend API je live i testirano (`API_NEW_ROUTES.md` dokumentacija dostupna)
- [ ] Frontend repo kreirano sa React/TypeScript setup
- [ ] Redux ili Context API setupovano
- [ ] Axios ili Fetch klijent konfigurisan sa base URL i JWT token handling
- [ ] Tailwind CSS ili UI library izbran i setup-ovan
- [ ] Mapa biblioteka izbrana (Leaflet/Mapbox) ako je Hotspots prioritet
- [ ] Git repo sa .gitignore, branch strategy (main/develop)
- [ ] TypeScript strict mode enabled
- [ ] ESLint + Prettier konfigurisani

---

## 📞 Backend Integration Notes

**Važne karakteristike za frontend inženjere**:

1. **API Response Wrapper**: Svi odgovori dolaze kao `ApiResponse<T>`:
   ```json
   {
     "success": true,
     "data": { /* actual response */ },
     "message": "Operation completed successfully",
     "errors": ["error1", "error2"] // prazan ako je success=true
   }
   ```

2. **JWT Token**: Pohrani u HttpOnly cookie (preferred) ili localStorage. Šalji kao:
   ```
   Authorization: Bearer {token}
   ```

3. **Role-Based Access**: Sve rute imaju `[Authorize(Roles = "...")]`. Frontend treba da:
   - Ekstraktuj roles iz JWT payload-a
   - Uslovno prikaži dugmići/linkove
   - Handle 403 Forbidden sa graceful error message

4. **Validation**: Backend vraća detaljne validacione greške u `errors` array-u. Prikaži ih user-friendly formatu

5. **Data Timestamps**: Sve `DateTime` polja su u ISO 8601 formatu. Program sa `new Date(isoString)` za JS Date objects

6. **Pagination**: (ako je dodano kasnije) Očekuj `pageNumber`, `pageSize`, `totalCount` u response

---

## 🚀 Sledeći koraci

**Za vas**:
1. Kreirajte frontend repo (ili otvore existing ako postoji)
2. Praćenje ovog plana po fazama
3. Paralelno: Start sa API service layer + Redux (Faza 6)
4. Prvo Auth (Faza 1), zatim Incidents (Faza 2)
5. Materials + Machines paralelno (Faze 3-4)

**Za mene (backend)**:
- ✓ Gotov
- Dostupan za:
  - Additional endpoints ako je potrebno
  - API dokumentacija pojašnjenja
  - Bugfix-e ako su pronađeni tijekom frontend razvoja
  - Performance tuning nakon testing-a

---

**Plan verzija**: 1.0  
**Poslednja ažuriranja**: Mart 27, 2026  
**Status**: Spreman za frontfrontend tim
