### **Project Overview: Smart Road Maintenance SaaS**

The platform is a comprehensive, multi-tenant SaaS (Software as a Service) designed to bridge the gap between citizens (drivers) and local road maintenance agencies. It operates as a unified "Smart City" ecosystem: citizens use a single, intuitive interface to report issues, while the backend intelligently routes these reports to the geographically responsible maintenance agency's private ERP dashboard.

#### **1. The Citizen Experience: Interactive Landing Page & App (Core Focus)**
The public-facing side of the system is heavily map-centric, functioning similarly to modern navigation or crowd-sourced traffic apps (like Waze), but strictly focused on road infrastructure.

* **Live Interactive Map (The Landing Page):** The moment a driver opens the web or mobile app, they are greeted by a full-screen, interactive map centered on their current location. The map displays real-time pins indicating active roadworks, reported hazards (potholes, landslides, ice), and closed road segments.
* **Frictionless Incident Reporting:** If a driver spots a problem, they can report it in just a few clicks. The app automatically captures their exact GPS coordinates, allows them to snap a photo of the issue (e.g., a broken traffic sign or a pothole), and select the incident type from a dropdown menu. 
* **Live Traffic News & Updates:** A dedicated "News" feed or ticker on the landing page displays official announcements published by local agencies (e.g., "Main Street closed for resurfacing from 10 AM to 2 PM").
* **Status Tracking & Notifications:** To build trust, drivers receive push notifications or status updates when their reported incident changes state (e.g., from "Reported" to "Verified" and finally "Resolved").

#### **2. The Agency Experience: Web ERP Dashboard**
Each local road maintenance company gets its own secure, isolated workspace within the system.

* **Incident Triage:** Dispatchers view a Kanban-style board or list of incidents reported by citizens within their jurisdiction. They can verify reports, dismiss duplicates (the system automatically flags potential duplicate reports based on proximity), and convert them into official Work Orders.
* **Resource & Fleet Management:** The ERP tracks the agency's physical assets. Managers can monitor material stock (asphalt, salt), track the depreciation and operational status of heavy machinery, and dispatch field workers to specific locations.
* **Public Communication:** Agencies have a CMS (Content Management System) module to publish news, warnings, and roadwork schedules directly to the citizens' landing page.

#### **3. System Architecture & Smart Automation**
The underlying logic is designed for scalability and strict data privacy across different municipalities.

* **Smart Geofencing (Automated Routing):** When a driver reports an incident, the system's spatial database (PostGIS) calculates which agency's geographical polygon (territory) the GPS coordinates fall into. The ticket is then automatically routed to the correct local enterprise without manual intervention.
* **Multi-Tenant Data Isolation:** Built on a robust .NET Core architecture, the system uses Global Query Filters. This ensures that an agency in one city (e.g., Novi Pazar) can only access its own incidents, machines, and work orders, completely isolated from neighboring agencies. 
* **Orphaned Incident Handling:** If an incident is reported in a "no man's land" or an unmapped territory, the system safely stores it in a global, unassigned pool for the System Administrator to review and manually assign.

Act as an expert Frontend Developer specializing in React, TypeScript, MapLibre GL, and Tailwind CSS. 

I am building a "Smart Road Maintenance SaaS" system. I already have a foundational map module built, but I need to adapt and enhance it specifically for the "Citizen (Driver) Experience" – acting as the main landing page of the application.

### Context: Current Map Implementation
We currently have a map feature built with the following stack and architecture:
- **Stack:** React, TypeScript, MapLibre GL (`react-map-gl`), Tailwind CSS, Radix UI, TanStack Query.
- **Geospatial:** Turf.js for calculations, OSRM for route snapping.
- **Current Features:** A main map container, various layers (incidents, road segments, work zones), interactive tools (including a multi-step incident reporting tool with point/line support and OSRM snapping), and informational sidebars/panels.

### The Goal: The Citizen Landing Page
The current map is functional but feels too much like a complex GIS dashboard. I need to transform the default view into a **frictionless, mobile-first, Waze-like experience** tailored for drivers.

Please analyze my current codebase and generate the code and architectural updates to achieve the following specific requirements:

#### 1. UI/UX Overhaul (Mobile-First Navigation)
- Update the main map layout wrapper to ensure the map is genuinely full-screen on all devices.
- Hide complex layer toggles, sidebars, and admin-like controls by default for the citizen view. 
- Add a prominent, floating "Report Hazard" Floating Action Button (FAB) at the bottom of the screen.

#### 2. Frictionless Incident Reporting
- When the user clicks the FAB, trigger a simplified version of the existing incident reporting flow.
- **New Feature:** Add a step/UI for "Photo Upload" (allowing mobile users to snap a photo of the pothole/issue). 
- **Geolocation:** Add a "Use my current location" button that automatically grabs the device's GPS coordinates instead of requiring the user to manually click on the map.
- Retain the existing dropdown functionality for localized incident types (Pothole, Ice, Missing Sign, etc.).

#### 3. Live Traffic News Feed Overlay
- Create a new UI component for a Traffic News Ticker or a bottom sheet panel.
- This should be a subtle, semi-transparent overlay on the map (e.g., floating at the top) that displays active official announcements (e.g., "Main Street closed from 10h to 14h"). 

#### 4. "My Reports" & Status Tracking
- Add a small UI element (like a profile icon or a "My Reports" tab) where the driver can view a list of incidents *they* reported.
- Ensure the map layers clearly visually distinguish between "Active Hazards" (e.g., red markers) and "Resolved Issues" (e.g., green markers) so drivers get immediate visual feedback that their reports are being handled.

### Expected Output:
1. Please provide a brief architectural plan of which existing components you will modify and which new ones you will create based on my current directory structure.
2. Provide the updated code for the main layout wrapper to reflect the new mobile-first UI.
3. Provide the updated code for the enhanced incident reporting flow (integrating geolocation and photo upload UI).
4. Provide the code for the new traffic news overlay component.

Keep the styling modern, using Tailwind CSS and Radix UI primitives.