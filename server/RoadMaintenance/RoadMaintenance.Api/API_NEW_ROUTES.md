# API New Routes (MVP Extension)

This document covers only newly added routes.

## Conventions

- Base URL: `https://localhost:7204`
- Auth header: `Authorization: Bearer <jwt-token>`
- Response wrapper:

```json
{
  "success": true,
  "data": {},
  "message": "Optional message",
  "errors": null
}
```

---

## 1) Auth - New Routes

### 1.1 Register Staff User (Admin only)
- Method: `POST`
- Route: `/api/auth/admin/register`
- Roles: `Admin`

Request:
```json
{
  "email": "worker1@road.local",
  "password": "Password123",
  "confirmPassword": "Password123",
  "firstName": "Marko",
  "lastName": "Markovic",
  "role": "FieldWorker"
}
```

Response 200:
```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "expiration": "2026-03-27T12:30:00Z",
    "userId": "a1b2c3d4",
    "email": "worker1@road.local",
    "fullName": "Marko Markovic",
    "roles": ["FieldWorker"]
  },
  "message": "Staff user registration successful.",
  "errors": null
}
```

### 1.2 Update My Profile
- Method: `PUT`
- Route: `/api/auth/me/profile`
- Roles: any authenticated user

Request:
```json
{
  "firstName": "Petar",
  "lastName": "Petrovic"
}
```

Response 200:
```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "errors": null
}
```

### 1.3 Set User Active Status (Admin only)
- Method: `PATCH`
- Route: `/api/auth/users/{userId}/active`
- Roles: `Admin`

Request:
```json
{
  "isActive": false
}
```

Response 200:
```json
{
  "success": true,
  "message": "User status updated successfully.",
  "errors": null
}
```

### 1.4 Assign User Role (Admin only)
- Method: `PATCH`
- Route: `/api/auth/users/{userId}/role`
- Roles: `Admin`

Request:
```json
{
  "role": "Dispatcher"
}
```

Response 200:
```json
{
  "success": true,
  "message": "User role updated successfully.",
  "errors": null
}
```

---

## 2) Incidents - New Routes

### 2.1 Verify Incident
- Method: `PATCH`
- Route: `/api/incidents/{id}/verify`
- Roles: `Admin`, `Dispatcher`, `MaintenanceManager`

Request body: none

Response 200 (example):
```json
{
  "success": true,
  "data": {
    "id": "11111111-1111-1111-1111-111111111111",
    "type": "Pothole",
    "typeName": "Pothole",
    "status": "Verified",
    "statusName": "Verified",
    "description": "Large pothole near bus stop",
    "latitude": 44.7866,
    "longitude": 20.4489,
    "locationDescription": "Main street lane 2",
    "roadSegmentId": "22222222-2222-2222-2222-222222222222",
    "roadSegmentName": "Main Street Segment A",
    "reportedByUserId": "driver-123",
    "reportedAt": "2026-03-27T08:00:00Z",
    "verifiedAt": "2026-03-27T08:10:00Z",
    "resolvedAt": null,
    "hasPotentialDuplicates": false,
    "potentialDuplicateIds": null
  },
  "message": "Incident verified successfully.",
  "errors": null
}
```

### 2.2 Resolve Incident
- Method: `PATCH`
- Route: `/api/incidents/{id}/resolve`
- Roles: `Admin`, `Dispatcher`, `MaintenanceManager`

Request body: none

Response 200: same `IncidentResponse` shape, with `status` = `Resolved` and `resolvedAt` set.

### 2.3 Mark Incident as Duplicate
- Method: `PATCH`
- Route: `/api/incidents/{id}/mark-duplicate/{relatedIncidentId}`
- Roles: `Admin`, `Dispatcher`, `MaintenanceManager`

Request body: none

Response 200: same `IncidentResponse` shape, with duplicate relation reflected.

---

## 3) Materials - New Routes

### 3.1 Get All Materials
- Method: `GET`
- Route: `/api/materials`
- Roles: any authenticated user

Response 200:
```json
{
  "success": true,
  "data": [
    {
      "id": "33333333-3333-3333-3333-333333333333",
      "name": "Asphalt Mix",
      "unit": "tons",
      "currentQuantity": 120.5,
      "minimumThreshold": 20,
      "unitCost": 95,
      "totalValue": 11447.5,
      "isBelowThreshold": false,
      "lastUpdated": "2026-03-27T09:00:00Z"
    }
  ],
  "message": null,
  "errors": null
}
```

### 3.2 Get Material By Id
- Method: `GET`
- Route: `/api/materials/{id}`
- Roles: any authenticated user

Response 200: one `MaterialResponse` object.

### 3.3 Create Material
- Method: `POST`
- Route: `/api/materials`
- Roles: `Admin`, `Dispatcher`, `MaintenanceManager`

Request:
```json
{
  "name": "Road Paint",
  "unit": "liters",
  "currentQuantity": 500,
  "minimumThreshold": 100,
  "unitCost": 4.2
}
```

Response 201: created `MaterialResponse`.

### 3.4 Update Material
- Method: `PUT`
- Route: `/api/materials/{id}`
- Roles: `Admin`, `Dispatcher`, `MaintenanceManager`

Request:
```json
{
  "name": "Road Paint White",
  "unit": "liters",
  "minimumThreshold": 120,
  "unitCost": 4.5
}
```

Response 200: updated `MaterialResponse`.

### 3.5 Add Material Stock
- Method: `PATCH`
- Route: `/api/materials/{id}/stock/add`
- Roles: `Admin`, `Dispatcher`, `MaintenanceManager`

Request:
```json
{
  "quantity": 50,
  "workOrderId": null
}
```

Response 200: updated `MaterialResponse`.

### 3.6 Consume Material Stock
- Method: `PATCH`
- Route: `/api/materials/{id}/stock/consume`
- Roles: `Admin`, `Dispatcher`, `MaintenanceManager`, `FieldWorker`

Request:
```json
{
  "quantity": 10,
  "workOrderId": "44444444-4444-4444-4444-444444444444"
}
```

Response 200: updated `MaterialResponse`.

Note: if `workOrderId` is provided, consumed amount is also added to `WorkOrder.ActualCost`.

---

## 4) Machines - New Routes

### 4.1 Get All Machines
- Method: `GET`
- Route: `/api/machines`
- Roles: any authenticated user

Response 200: list of `MachineResponse`.

### 4.2 Get Machine By Id
- Method: `GET`
- Route: `/api/machines/{id}`
- Roles: any authenticated user

Response 200: single `MachineResponse`.

### 4.3 Create Machine
- Method: `POST`
- Route: `/api/machines`
- Roles: `Admin`, `Dispatcher`, `MaintenanceManager`

Request:
```json
{
  "name": "Snow Plow 01",
  "machineType": "SnowPlow",
  "acquisitionYear": 2022,
  "purchasePrice": 80000,
  "usefulLifeYears": 10,
  "residualValue": 10000,
  "registrationNumber": "BG-123-AB",
  "notes": "Ready for winter season"
}
```

Response 201: created `MachineResponse`.

### 4.4 Update Machine
- Method: `PUT`
- Route: `/api/machines/{id}`
- Roles: `Admin`, `Dispatcher`, `MaintenanceManager`

Request: same shape as create.

Response 200: updated `MachineResponse`.

### 4.5 Set Machine Operational Status
- Method: `PATCH`
- Route: `/api/machines/{id}/operational`
- Roles: `Admin`, `Dispatcher`, `MaintenanceManager`

Request:
```json
{
  "isOperational": false,
  "reason": "Engine service needed"
}
```

Response 200: updated `MachineResponse`.

### 4.6 Record Machine Maintenance
- Method: `PATCH`
- Route: `/api/machines/{id}/maintenance`
- Roles: `Admin`, `Dispatcher`, `MaintenanceManager`, `FieldWorker`

Request:
```json
{
  "notes": "Oil and filter changed"
}
```

Response 200: updated `MachineResponse`.

---

## 5) Analytics - New Routes

All analytics routes require one of: `Admin`, `Dispatcher`, `MaintenanceManager`.

### 5.1 Get Hotspots
- Method: `GET`
- Route: `/api/analytics/hotspots`

Example query:
`/api/analytics/hotspots?fromDate=2026-03-01&toDate=2026-03-31&clusterRadiusMeters=500&minimumIncidents=3`

Response 200:
```json
{
  "success": true,
  "data": [
    {
      "centerLatitude": 44.81,
      "centerLongitude": 20.46,
      "incidentCount": 6,
      "incidentIds": [
        "55555555-5555-5555-5555-555555555555",
        "66666666-6666-6666-6666-666666666666"
      ]
    }
  ],
  "message": null,
  "errors": null
}
```

### 5.2 Get Average Response Time
- Method: `GET`
- Route: `/api/analytics/response-time`

Example query:
`/api/analytics/response-time?fromDate=2026-03-01&toDate=2026-03-31`

Response 200:
```json
{
  "success": true,
  "data": {
    "incidentCount": 18,
    "averageHours": 7.25
  },
  "message": null,
  "errors": null
}
```

### 5.3 Get Budget Overview
- Method: `GET`
- Route: `/api/analytics/budget-overview`

Example query:
`/api/analytics/budget-overview?fromDate=2026-03-01&toDate=2026-03-31`

Response 200:
```json
{
  "success": true,
  "data": {
    "emergencyCost": 15200,
    "regularCost": 48900,
    "totalCost": 64100
  },
  "message": null,
  "errors": null
}
```
