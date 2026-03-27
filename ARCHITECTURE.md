# Road Maintenance System – Architecture Guide

This document explains the architecture and code structure of the Road Maintenance System. Read through the phases in order to understand how everything fits together.

---

## Table of Contents

1. [Phase 1: Domain Layer – The Heart of the Application](#phase-1-domain-layer)
2. [Phase 2: Infrastructure Layer – Data Access & External Concerns](#phase-2-infrastructure-layer)
3. [Phase 3: API Layer – Entry Point & Features](#phase-3-api-layer)
4. [Phase 4: Authentication & Authorization](#phase-4-authentication--authorization)
5. [Phase 5: Feature Slices – Vertical Architecture](#phase-5-feature-slices)
6. [Key Concepts & Patterns](#key-concepts--patterns)

---

## Phase 1: Domain Layer

**Project:** `RoadMaintenance.Domain`

The Domain layer contains the core business logic. It has **no dependencies** on other projects – this is intentional. The domain should be "pure" and not know about databases, HTTP, or any infrastructure concerns.

### 1.1 Start with Enums

Read these files first to understand the vocabulary of the domain:

| File | Purpose |
|------|---------|
| `Enums/RoadCategory.cs` | Highway, MainRoad, LocalRoad – used for priority calculations |
| `Enums/RoadStatus.cs` | Open, WorksInProgress, Closed, Dangerous |
| `Enums/IncidentType.cs` | Pothole, Ice, TrafficLightIssue, SignIssue, etc. |
| `Enums/IncidentStatus.cs` | Reported → Verified → WorkOrderIssued → Resolved (the workflow) |
| `Enums/WorkOrderStatus.cs` | Created → Scheduled → InProgress → Completed |
| `Enums/WorkType.cs` | PotholeRepair, SnowRemoval, SignReplacement, etc. |
| `Enums/AssetType.cs` | Bridge, TrafficLight, Sign, HorizontalMarking, etc. |

### 1.2 Domain Entities

These are the core business objects. Notice how they:
- Have **private constructors** (you can't just `new` them up)
- Use **factory methods** like `Create(...)` for construction
- Contain **validation logic** inside the entity
- Have **behavior methods** that enforce business rules

**Read in this order:**

1. **`Entities/RoadSegment.cs`** – Simplest entity. Represents a road section.
   - Notice: `Create()` factory method validates inputs
   - Notice: `UpdateStatus()` method encapsulates the state change

2. **`Entities/InfrastructureAsset.cs`** – An asset (bridge, sign, etc.) with GPS coordinates.
   - Notice: `ValidateCoordinates()` ensures lat/lon are valid

3. **`Entities/IncidentReport.cs`** – Most complex entity. The core of the system.
   - Notice: Status transitions are enforced via methods like `Verify()`, `Resolve()`
   - Notice: `MarkAsDuplicate()` handles the duplicate detection workflow
   - Key pattern: **You can't set Status directly** – you must call the right method

4. **`Entities/WorkOrder.cs`** – Created from incidents, assigned to field workers.
   - Notice: `Schedule()`, `StartWork()`, `Complete()` enforce the workflow
   - Notice: Each method validates the current state before transitioning

5. **`Entities/MaterialStock.cs`** – Inventory tracking (asphalt, salt, paint).
   - Notice: `ConsumeStock()` throws if insufficient stock

6. **`Entities/Machine.cs`** – Equipment with depreciation calculations.
   - Notice: `AnnualDepreciation` and `CurrentBookValue` are computed properties

### 1.3 Domain Services

Services contain logic that doesn't belong to a single entity:

1. **`Services/ILocationService.cs`** – Interface (abstraction) for location operations.
   - Defines `Location` record and `IncidentCluster` for hotspot analysis
   - Methods: `AreLocationsClose()`, `FindPotentialDuplicates()`, `GroupIncidentsIntoClusters()`
   - **Key insight:** This is a "black box" – the domain defines WHAT it needs, not HOW it's done

2. **`Services/WorkOrderPriorityService.cs`** – Calculates work order priority.
   - Combines road category (highway = highest) with incident type (safety = highest)
   - Returns a priority number (lower = more urgent)

---

## Phase 2: Infrastructure Layer

**Project:** `RoadMaintenance.Infrastructure`

The Infrastructure layer implements the "how" – database access, external services, Identity. It **depends on Domain** but Domain doesn't know Infrastructure exists.

### 2.1 Identity

1. **`Identity/ApplicationUser.cs`** – Extends ASP.NET Core's `IdentityUser`.
   - Adds: `FirstName`, `LastName`, `CreatedAt`, `IsActive`
   - Pattern: Extend the built-in user when you need custom properties

2. **`Identity/ApplicationRoles.cs`** – Constants for role names.
   - Driver, FieldWorker, Dispatcher, MaintenanceManager
   - Using constants avoids "magic strings" scattered through the code

### 2.2 Persistence

1. **`Persistence/AppDbContext.cs`** – The EF Core database context.
   - Inherits from `IdentityDbContext<ApplicationUser>` to include Identity tables
   - Declares `DbSet<T>` for each entity
   - `ApplyConfigurationsFromAssembly()` loads all Fluent API configs automatically

### 2.3 Entity Configurations (Fluent API)

These files configure how entities map to database tables. Read any one to understand the pattern:

| File | Key configurations |
|------|-------------------|
| `Configuration/RoadSegmentConfiguration.cs` | Max lengths, required fields, indexes |
| `Configuration/IncidentReportConfiguration.cs` | Foreign keys, self-referencing relationship for duplicates |
| `Configuration/WorkOrderConfiguration.cs` | Decimal precision for costs |
| `Configuration/InfrastructureAssetConfiguration.cs` | Relationship to RoadSegment |
| `Configuration/MaterialStockConfiguration.cs` | Unique index on Name |
| `Configuration/MachineConfiguration.cs` | Filtered unique index (only non-null registration numbers) |

**Key patterns to notice:**
- `builder.Property(...).IsRequired().HasMaxLength(200)` – Constraints
- `builder.HasOne(...).WithMany(...).HasForeignKey(...)` – Relationships
- `builder.HasIndex(...)` – Database indexes for query performance

### 2.4 Services Implementation

1. **`Services/SimpleLocationService.cs`** – Implements `ILocationService`.
   - Uses the **Haversine formula** to calculate GPS distance
   - `FindPotentialDuplicates()` checks same type + close location + recent time
   - `GroupIncidentsIntoClusters()` simple greedy clustering for hotspot analysis
   - **Key insight:** This is swappable. Later you could inject a GIS service instead.

### 2.5 Dependency Injection

1. **`DependencyInjection.cs`** – The `AddInfrastructure()` extension method.
   - Registers `AppDbContext` with SQL Server
   - Configures ASP.NET Core Identity with password rules
   - Registers domain services (`ILocationService`, `IWorkOrderPriorityService`)
   - **Pattern:** Keep all DI registration in one place per layer

---

## Phase 3: API Layer

**Project:** `RoadMaintenance.Api`

The API layer is the entry point. It handles HTTP, authentication, and orchestrates the features.

### 3.1 Configuration

1. **`appsettings.json`** / **`appsettings.Development.json`**
   - Connection strings for SQL Server (LocalDB)
   - JWT settings: SecretKey, Issuer, Audience, Expiration
   - **Never commit real secrets** – use User Secrets or environment variables in production

### 3.2 Common Utilities

1. **`Common/JwtSettings.cs`** – Strongly-typed configuration class.
   - Bound to the `JwtSettings` section in appsettings
   - Pattern: Use `IOptions<JwtSettings>` to inject configuration

2. **`Common/ApiResponse.cs`** – Standardized API response wrapper.
   - `ApiResponse<T>.Ok(data)` for success
   - `ApiResponse.Fail(message, errors)` for failures
   - Ensures consistent JSON structure for all endpoints

### 3.3 Program.cs – The Application Bootstrap

Read `Program.cs` section by section:

```
1. AddInfrastructure() – Registers all infrastructure services
2. AddScoped<IAuthService>() – Registers auth service
3. AddScoped<...Handler>() – Registers feature handlers
4. JWT Configuration – Sets up token validation
5. Authorization Policies – Named policies for role checks
6. AddControllers() – Enables MVC controllers
7. AddOpenApi() – Built-in .NET 10 OpenAPI support
8. CORS – Allows React frontend to call the API
9. DataSeeder.SeedDatabaseAsync() – Seeds roles on startup
10. Middleware pipeline – Auth → CORS → Controllers
```

---

## Phase 4: Authentication & Authorization

### 4.1 Data Seeding

1. **`Auth/DataSeeder.cs`** – Called at startup.
   - Creates the database if it doesn't exist
   - Seeds the four roles (Driver, FieldWorker, Dispatcher, MaintenanceManager)

### 4.2 Auth Contracts

1. **`Auth/Contracts/AuthContracts.cs`** – DTOs for auth endpoints.
   - `RegisterRequest` – Email, password, name
   - `LoginRequest` – Email, password
   - `AuthResponse` – Token, expiration, user info, roles

### 4.3 Auth Service

1. **`Auth/AuthService.cs`** – Business logic for authentication.
   - `RegisterDriverAsync()` – Creates user, assigns Driver role, returns JWT
   - `LoginAsync()` – Validates credentials, returns JWT
   - `GenerateJwtToken()` – Creates the JWT with claims (userId, email, roles)

**Key JWT concepts:**
- Claims are key-value pairs stored in the token
- `ClaimTypes.Role` is used by `[Authorize(Roles = "...")]`
- Token is signed with HMAC-SHA256 using the secret key

### 4.4 Auth Controller

1. **`Auth/AuthController.cs`** – HTTP endpoints.
   - `POST /api/auth/register` – Public, creates Driver account
   - `POST /api/auth/login` – Public, returns JWT
   - `GET /api/auth/me` – Protected, returns current user info

**Patterns to notice:**
- `[AllowAnonymous]` – Skips auth for this endpoint
- `[Authorize]` – Requires valid JWT
- `[Authorize(Roles = "Dispatcher")]` – Requires specific role

---

## Phase 5: Feature Slices

The Features folder uses **vertical slice architecture**. Each feature is self-contained with its own:
- Request/Response DTOs (Contracts)
- Handler (business logic)
- Controller (HTTP endpoint)

### 5.1 Incidents Feature

**Folder:** `Features/Incidents/`

1. **`Contracts/IncidentContracts.cs`** – All DTOs for incidents.
   - `CreateIncidentRequest` – What the client sends
   - `GetIncidentsQuery` – Filter/pagination parameters
   - `IncidentResponse` – What we return (flattened from entity)
   - `PaginatedResponse<T>` – Generic pagination wrapper

2. **`CreateIncidentHandler.cs`** – Handles incident creation.
   - Validates the road segment exists (if provided)
   - Calls `ILocationService.FindPotentialDuplicates()` – duplicate detection
   - Creates `IncidentReport` via factory method
   - Saves to database
   - **One handler = one use case** (Single Responsibility)

3. **`GetIncidentsHandler.cs`** – Handles incident queries.
   - Builds query with optional filters (status, type, date range, etc.)
   - Applies pagination (Skip/Take)
   - Projects to `IncidentResponse` DTOs
   - Uses `IQueryable` for efficient SQL generation

4. **`GetIncidentByIdHandler.cs`** – Gets single incident.
   - Includes related data (RoadSegment, WorkOrder)
   - Returns null if not found

5. **`IncidentsController.cs`** – HTTP endpoints.
   - `POST /api/incidents` – Create (Driver only)
   - `GET /api/incidents` – List with filters
   - `GET /api/incidents/{id}` – Get by ID
   - `GET /api/incidents/my` – Driver's own incidents

**Key patterns:**
- Controllers are thin – they just call handlers
- Handlers contain the logic
- DTOs protect the domain from HTTP concerns

---

## Key Concepts & Patterns

### Rich Domain Model
Entities contain behavior, not just data:
```csharp
// Bad: Anemic model
incident.Status = IncidentStatus.Verified;  // Anyone can set anything!

// Good: Rich model
incident.Verify(userId);  // Validates state, records who verified
```

### Factory Methods
Control object creation:
```csharp
// Bad: Public constructor
var segment = new RoadSegment();  // Invalid state!

// Good: Factory method
var segment = RoadSegment.Create(name, category, length, description);  // Validated
```

### Interface Abstraction
Program to interfaces, not implementations:
```csharp
// ILocationService is defined in Domain (what we need)
// SimpleLocationService is in Infrastructure (how it's done)
// Later: GoogleMapsLocationService could replace it
```

### Vertical Slices
Group by feature, not by type:
```
// Instead of:
Controllers/IncidentsController.cs
Services/IncidentService.cs
DTOs/IncidentDto.cs

// We have:
Features/Incidents/IncidentsController.cs
Features/Incidents/CreateIncidentHandler.cs
Features/Incidents/Contracts/IncidentContracts.cs
```

### Dependency Injection
Services are registered in one place and injected via constructors:
```csharp
public class CreateIncidentHandler(
    AppDbContext context,          // Injected
    ILocationService locationService)  // Injected
{ }
```

---

## Next Steps

After understanding this architecture, you can:

1. **Run the API** – `dotnet run --project RoadMaintenance.Api`
2. **Create a migration** – `dotnet ef migrations add Initial -p RoadMaintenance.Infrastructure -s RoadMaintenance.Api`
3. **Test with OpenAPI** – Navigate to `/openapi/v1.json`
4. **Add new features** – Follow the Incidents pattern for WorkOrders, Assets, etc.

---

## File Reading Order (Quick Reference)

For the fastest understanding, read files in this exact order:

1. `Domain/Enums/*.cs` (all 7 files)
2. `Domain/Entities/RoadSegment.cs`
3. `Domain/Entities/IncidentReport.cs`
4. `Domain/Services/ILocationService.cs`
5. `Domain/Services/WorkOrderPriorityService.cs`
6. `Infrastructure/Identity/ApplicationUser.cs`
7. `Infrastructure/Persistence/AppDbContext.cs`
8. `Infrastructure/Configuration/IncidentReportConfiguration.cs`
9. `Infrastructure/Services/SimpleLocationService.cs`
10. `Infrastructure/DependencyInjection.cs`
11. `Api/Common/ApiResponse.cs`
12. `Api/Auth/AuthService.cs`
13. `Api/Auth/AuthController.cs`
14. `Api/Features/Incidents/Contracts/IncidentContracts.cs`
15. `Api/Features/Incidents/CreateIncidentHandler.cs`
16. `Api/Features/Incidents/IncidentsController.cs`
17. `Api/Program.cs`
