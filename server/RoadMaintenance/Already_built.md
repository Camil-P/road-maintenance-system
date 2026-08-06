# RoadMaintenance API - Already Built (Current State)

Short inventory of what is currently implemented in server/RoadMaintenance.Api.

## Auth and User Management
- POST /api/auth/register: register Driver account
- POST /api/auth/login: login and get JWT
- GET /api/auth/me: get current authenticated user
- PUT /api/auth/me/profile: update current user profile
- GET /api/auth/users: list users (Admin, MaintenanceManager)
- POST /api/auth/admin/register: create non-driver user (Admin)
- PATCH /api/auth/users/{userId}/active: activate/deactivate user (Admin)
- PATCH /api/auth/users/{userId}/role: change user role (Admin)

## Incidents
- POST /api/incidents: create incident (includes duplicate detection)
- GET /api/incidents: list/filter incidents (drivers are scoped to own reports)
- GET /api/incidents/{id}: get incident by id
- GET /api/incidents/my: get current user's incidents
- PATCH /api/incidents/{id}/verify: verify incident
- PATCH /api/incidents/{id}/resolve: resolve incident
- PATCH /api/incidents/{id}/mark-duplicate/{relatedIncidentId}: mark duplicate link

## Work Orders
- POST /api/workorders: create work order
- GET /api/workorders: list/filter work orders
- GET /api/workorders/{id}: get work order by id
- GET /api/workorders/my: get work orders assigned to current user
- PATCH /api/workorders/{id}/status: update work order status

## Road Segments
- GET /api/roadsegments: list/filter road segments
- GET /api/roadsegments/{id}: get road segment by id
- POST /api/roadsegments: create road segment
- PUT /api/roadsegments/{id}: update road segment details
- PATCH /api/roadsegments/{id}/status: update operational status

## Materials
- GET /api/materials: list materials
- GET /api/materials/{id}: get material by id
- POST /api/materials: create material
- PUT /api/materials/{id}: update material
- PATCH /api/materials/{id}/stock/add: increase stock
- PATCH /api/materials/{id}/stock/consume: consume stock (optionally linked to work order)

## Machines
- GET /api/machines: list machines
- GET /api/machines/{id}: get machine by id
- POST /api/machines: create machine
- PUT /api/machines/{id}: update machine
- PATCH /api/machines/{id}/operational: set operational status
- PATCH /api/machines/{id}/maintenance: record maintenance event

## Analytics
- GET /api/analytics/hotspots: incident hotspot summary
- GET /api/analytics/response-time: average response time summary
- GET /api/analytics/budget-overview: budget overview summary

## Notes
- All controllers return standardized ApiResponse payloads.
- Most endpoints are protected with JWT auth and role-based authorization.
- This list reflects implemented controllers/routes only (not planned features).
