-- =============================================
-- USER ID CHEAT SHEET (iz DataSeeder-a)
-- Nikola Jovanović  (Dispatcher)   = '550e8401-e29b-41d4-a716-446655440003'
-- Ana Đorđević      (Dispatcher)   = '550e8401-e29b-41d4-a716-446655440004'
-- Dragan Stojanović (FieldWorker)  = '550e8401-e29b-41d4-a716-446655440005'
-- Vojislav Milovanović (FieldWorker)= '550e8401-e29b-41d4-a716-446655440006'
-- Zoran Lazić       (Driver)       = '550e8401-e29b-41d4-a716-446655440007'
-- Milica Ilić       (Driver)       = '550e8401-e29b-41d4-a716-446655440008'
-- =============================================

-- KORAK 0: Agencies (Novi entiteti za Multi-tenant)
INSERT INTO "Agencies" (
    "Id", "Name", "IsActive", "CreatedAt", "Type"
)
VALUES
('c50e8400-0000-0000-0000-000000000001', 'Putevi Srbije - Region Sever', true, '2026-01-01 08:00:00', 0),
('c50e8400-0000-0000-0000-000000000002', 'Putevi Srbije - Region Jug', true, '2026-01-01 08:00:00', 0);


-- KORAK 1: Work Orders (MustHaveTenant - Svi moraju imati AgencyId)
INSERT INTO "WorkOrders" (
    "Id", "WorkType", "Status", "Priority", "Description",
    "RoadSegmentId", "IncidentReportId",
    "CreatedByUserId", "AssignedToUserId",
    "EstimatedCost", "ActualCost", "IsEmergency", "CompletionNotes",
    "CreatedAt", "ScheduledFor", "StartedAt", "CompletedAt", "AgencyId"
)
VALUES
-- Completed: Zatrpavanje rupe na A1 (Agency 1)
('a50e8400-0000-0000-0000-000000000001', 1, 4, 1,
 'Zatrpavanje velikog potholea na A1 kod Jagnjila. Prijavila rupa prečnika ~50cm, hitno.',
 '550e8400-e29b-41d4-a716-446655440001', NULL,
 '550e8401-e29b-41d4-a716-446655440003', '550e8401-e29b-41d4-a716-446655440005',
 3500.00, 3200.00, false, 'Pothole uspešno zatrpan, asfaltirano područje 2x2m.',
 '2026-03-20 08:00:00', '2026-03-20 09:00:00', '2026-03-20 10:00:00', '2026-03-20 14:30:00',
 'c50e8400-0000-0000-0000-000000000001'),

-- Completed: Čišćenje snega na A1 (Agency 1)
('a50e8400-0000-0000-0000-000000000002', 3, 4, 2,
 'Čišćenje snega i posipanje soli na A1 kod Leskovca posle obilnog snegopada.',
 '550e8400-e29b-41d4-a716-446655440001', NULL,
 '550e8401-e29b-41d4-a716-446655440003', '550e8401-e29b-41d4-a716-446655440006',
 1800.00, 1650.00, false, 'Sneg uklonjen na deonici od 15km. Sol rasuta.',
 '2026-01-15 06:00:00', '2026-01-15 07:00:00', '2026-01-15 07:30:00', '2026-01-15 11:00:00',
 'c50e8400-0000-0000-0000-000000000001'),

-- InProgress: Popravka semafora Beograd (Agency 1)
('a50e8400-0000-0000-0000-000000000003', 5, 3, 1,
 'Popravka semafora na Terazijama - zapeo na crvenom, uzrokuje veliku gužvu.',
 '550e8400-e29b-41d4-a716-446655440003', NULL,
 '550e8401-e29b-41d4-a716-446655440004', '550e8401-e29b-41d4-a716-446655440005',
 5000.00, NULL, true, NULL,
 '2026-03-26 18:00:00', '2026-03-27 08:00:00', '2026-03-27 09:00:00', NULL,
 'c50e8400-0000-0000-0000-000000000001'),

-- Scheduled: Zamena saobraćajnog znaka Čačak (Agency 2)
('a50e8400-0000-0000-0000-000000000004', 6, 2, 3,
 'Zamena pokidanog saobraćajnog znaka na A1 kod Čačka (ograničenje brzine + upozorenje).',
 '550e8400-e29b-41d4-a716-446655440007', NULL,
 '550e8401-e29b-41d4-a716-446655440004', '550e8401-e29b-41d4-a716-446655440006',
 800.00, NULL, false, NULL,
 '2026-03-23 15:00:00', '2026-03-28 08:00:00', NULL, NULL,
 'c50e8400-0000-0000-0000-000000000002'),

-- Scheduled: Obnova oznaka Beograd (Agency 1)
('a50e8400-0000-0000-0000-000000000005', 2, 2, 4,
 'Obnova horizontalnih oznaka (trake) na magistralnom putu kroz centar Beograda.',
 '550e8400-e29b-41d4-a716-446655440003', NULL,
 '550e8401-e29b-41d4-a716-446655440003', '550e8401-e29b-41d4-a716-446655440005',
 4200.00, NULL, false, NULL,
 '2026-03-18 12:00:00', '2026-04-02 07:00:00', NULL, NULL,
 'c50e8400-0000-0000-0000-000000000001'),

-- Created: Popravka ograde Kopaonik (Agency 2)
('a50e8400-0000-0000-0000-000000000006', 7, 1, 2,
 'Popravka deformisane metalne ograde na planinskoj cesti kroz Kopaonik.',
 '550e8400-e29b-41d4-a716-446655440008', NULL,
 '550e8401-e29b-41d4-a716-446655440004', NULL,
 6500.00, NULL, false, NULL,
 '2026-03-21 17:00:00', NULL, NULL, NULL,
 'c50e8400-0000-0000-0000-000000000002'),

-- InProgress: Odvodnjavanje Niš (Agency 2)
('a50e8400-0000-0000-0000-000000000007', 8, 3, 2,
 'Čišćenje i popravka drenažnog sistema na magistralnom putu kod Niša zbog akumulacije vode.',
 '550e8400-e29b-41d4-a716-446655440009', NULL,
 '550e8401-e29b-41d4-a716-446655440003', '550e8401-e29b-41d4-a716-446655440006',
 3800.00, NULL, true, NULL,
 '2026-03-25 08:00:00', '2026-03-26 08:00:00', '2026-03-26 10:00:00', NULL,
 'c50e8400-0000-0000-0000-000000000002'),

-- Completed: Popravka rupe Kragujevac (Agency 2)
('a50e8400-0000-0000-0000-000000000008', 1, 4, 3,
 'Sanacija više pothola na lokalnom putu Kragujevac-Jagnjilo.',
 '550e8400-e29b-41d4-a716-446655440005', NULL,
 '550e8401-e29b-41d4-a716-446655440004', '550e8401-e29b-41d4-a716-446655440005',
 2100.00, 2350.00, false, 'Sanirano 6 rupa, ukupno 8m² asfalta.',
 '2026-03-22 10:00:00', '2026-03-22 12:00:00', '2026-03-22 13:00:00', '2026-03-22 17:00:00',
 'c50e8400-0000-0000-0000-000000000002');


-- KORAK 2: Incident Reports (MayHaveTenant - Može imati NULL vrednost za AgencyId)
INSERT INTO "IncidentReports" (
    "Id", "Type", "Status", "Description",
    "Latitude", "Longitude", "LocationDescription",
    "RoadSegmentId", "ReportedByUserId", "VerifiedByUserId",
    "WorkOrderId", "RelatedIncidentId",
    "ReportedAt", "VerifiedAt", "ResolvedAt", "AgencyId"
)
VALUES
-- Resolved: Pothole na A1 (vezan za WO 001, Agency 1)
('b50e8400-0000-0000-0000-000000000001', 1, 4,
 'Velika rupa na A1 kod Jagnjila, prečnika oko 50cm. Skoro sam pao u nju kamionom.',
 43.9284, 20.8972, 'A1 autoput, blizu izlaza Jagnjilo',
 '550e8400-e29b-41d4-a716-446655440001',
 '550e8401-e29b-41d4-a716-446655440007', '550e8401-e29b-41d4-a716-446655440003',
 'a50e8400-0000-0000-0000-000000000001', NULL,
 '2026-03-19 16:00:00', '2026-03-19 18:30:00', '2026-03-20 15:00:00', 'c50e8400-0000-0000-0000-000000000001'),

-- Resolved: Sneg na A1 (vezan za WO 002, Agency 1)
('b50e8400-0000-0000-0000-000000000002', 2, 4,
 'Na A1 kod Leskovca je jako puno snega, skoro nema vidljivosti. Opasno za vožnju.',
 43.1298, 21.9611, 'A1 autoput, kod Leskovca',
 '550e8400-e29b-41d4-a716-446655440001',
 '550e8401-e29b-41d4-a716-446655440008', '550e8401-e29b-41d4-a716-446655440003',
 'a50e8400-0000-0000-0000-000000000002', NULL,
 '2026-01-15 05:30:00', '2026-01-15 06:30:00', '2026-01-15 12:00:00', 'c50e8400-0000-0000-0000-000000000001'),

-- WorkOrderIssued: Semafor Terazije (vezan za WO 003, Agency 1)
('b50e8400-0000-0000-0000-000000000003', 3, 3,
 'Semafor na Terazijama zapeo na crvenom. Gužva ogromna, automobili idu pogrešnom stranom.',
 44.8210, 20.4589, 'Beograd, Terazije',
 '550e8400-e29b-41d4-a716-446655440003',
 '550e8401-e29b-41d4-a716-446655440007', '550e8401-e29b-41d4-a716-446655440004',
 'a50e8400-0000-0000-0000-000000000003', NULL,
 '2026-03-26 17:45:00', '2026-03-26 18:30:00', NULL, 'c50e8400-0000-0000-0000-000000000001'),

-- WorkOrderIssued: Znak Čačak (vezan za WO 004, Agency 2)
('b50e8400-0000-0000-0000-000000000004', 4, 3,
 'Saobraćajni znak upozorenja kod Čačka je pokidan, ne vidi se ograničenje brzine na krivini.',
 43.8960, 20.0507, 'A1 autoput, blizu Čačka',
 '550e8400-e29b-41d4-a716-446655440007',
 '550e8401-e29b-41d4-a716-446655440008', '550e8401-e29b-41d4-a716-446655440004',
 'a50e8400-0000-0000-0000-000000000004', NULL,
 '2026-03-23 14:00:00', '2026-03-23 15:30:00', NULL, 'c50e8400-0000-0000-0000-000000000002'),

-- Verified: Izblejene oznake A2 (vezan za WO 005, Agency 1)
('b50e8400-0000-0000-0000-000000000005', 5, 2,
 'Linije na magistralnom putu kroz Beograd su skoro nevidljive, posebno po kiši.',
 44.8210, 20.4589, 'Magistralni put M, centar Beograda',
 '550e8400-e29b-41d4-a716-446655440003',
 '550e8401-e29b-41d4-a716-446655440007', '550e8401-e29b-41d4-a716-446655440003',
 'a50e8400-0000-0000-0000-000000000005', NULL,
 '2026-03-18 11:00:00', '2026-03-18 13:00:00', NULL, 'c50e8400-0000-0000-0000-000000000001'),

-- Reported: Ograda Kopaonik (vezan za WO 006, Agency 2)
('b50e8400-0000-0000-0000-000000000006', 8, 1,
 'Metalina ograda na planinskoj cesti je deformisana, izgleda kao da ju je udario kamion.',
 43.6847, 20.8122, 'Kopaonik, planinska cesta',
 '550e8400-e29b-41d4-a716-446655440008',
 '550e8401-e29b-41d4-a716-446655440008', NULL,
 NULL, NULL,
 '2026-03-21 16:00:00', NULL, NULL, 'c50e8400-0000-0000-0000-000000000002'),

-- WorkOrderIssued: Poplave Niš (vezan za WO 007, Agency 2)
('b50e8400-0000-0000-0000-000000000007', 7, 3,
 'Voda se akumulirala na putu kod Niša, jezero na putu dubine 20cm. Nije prolazno.',
 43.3209, 21.8954, 'Magistralni put, Niš jug',
 '550e8400-e29b-41d4-a716-446655440009',
 '550e8401-e29b-41d4-a716-446655440007', '550e8401-e29b-41d4-a716-446655440003',
 'a50e8400-0000-0000-0000-000000000007', NULL,
 '2026-03-25 06:00:00', '2026-03-25 07:30:00', NULL, 'c50e8400-0000-0000-0000-000000000002'),

-- Resolved: Pothole Kragujevac (vezan za WO 008, Agency 2)
('b50e8400-0000-0000-0000-000000000008', 1, 4,
 'Ima nekoliko većih rupa na lokalnom putu Kragujevac-Jagnjilo, jako loše stanje kolnika.',
 44.0165, 20.9148, 'Lokalni put Kragujevac-Jagnjilo',
 '550e8400-e29b-41d4-a716-446655440005',
 '550e8401-e29b-41d4-a716-446655440008', '550e8401-e29b-41d4-a716-446655440004',
 'a50e8400-0000-0000-0000-000000000008', NULL,
 '2026-03-21 09:00:00', '2026-03-21 11:00:00', '2026-03-22 17:30:00', 'c50e8400-0000-0000-0000-000000000002'),

-- ====================================================================
-- OVI ZAPISI IMAJU AgencyId = NULL (za testiranje fallback/nullable logike)
-- ====================================================================

-- Reported: Debris na A1 (bez work order-a, tek prijavljen od Zorana)
('b50e8400-0000-0000-0000-000000000009', 6, 1,
 'Komad metalnog lima na sredini A1 kod Jagnjila, pada s kamiona koji je prošao.',
 43.9284, 20.8972, 'A1 autoput, Jagnjilo',
 '550e8400-e29b-41d4-a716-446655440001',
 '550e8401-e29b-41d4-a716-446655440007', NULL,
 NULL, NULL,
 '2026-03-27 07:15:00', NULL, NULL, NULL),

-- Verified: Sneg na Kopaoniku (bez work order-a, tek verifikovan od dispatcher-a)
('b50e8400-0000-0000-0000-000000000010', 2, 2,
 'Planinska cesta prema Kopaoniku je potpuno zaleđena, nema peskovanja.',
 43.6847, 20.8122, 'Kopaonik, planinska cesta',
 '550e8400-e29b-41d4-a716-446655440008',
 '550e8401-e29b-41d4-a716-446655440008', '550e8401-e29b-41d4-a716-446655440004',
 NULL, NULL,
 '2026-03-26 14:00:00', '2026-03-26 16:00:00', NULL, NULL);


-- KORAK 3: Ažuriraj WorkOrders.IncidentReportId (informativno, nema FK constraint)
UPDATE "WorkOrders" SET "IncidentReportId" = 'b50e8400-0000-0000-0000-000000000001' WHERE "Id" = 'a50e8400-0000-0000-0000-000000000001';
UPDATE "WorkOrders" SET "IncidentReportId" = 'b50e8400-0000-0000-0000-000000000002' WHERE "Id" = 'a50e8400-0000-0000-0000-000000000002';
UPDATE "WorkOrders" SET "IncidentReportId" = 'b50e8400-0000-0000-0000-000000000003' WHERE "Id" = 'a50e8400-0000-0000-0000-000000000003';
UPDATE "WorkOrders" SET "IncidentReportId" = 'b50e8400-0000-0000-0000-000000000004' WHERE "Id" = 'a50e8400-0000-0000-0000-000000000004';
UPDATE "WorkOrders" SET "IncidentReportId" = 'b50e8400-0000-0000-0000-000000000005' WHERE "Id" = 'a50e8400-0000-0000-0000-000000000005';
UPDATE "WorkOrders" SET "IncidentReportId" = 'b50e8400-0000-0000-0000-000000000006' WHERE "Id" = 'a50e8400-0000-0000-0000-000000000006';
UPDATE "WorkOrders" SET "IncidentReportId" = 'b50e8400-0000-0000-0000-000000000007' WHERE "Id" = 'a50e8400-0000-0000-0000-000000000007';
UPDATE "WorkOrders" SET "IncidentReportId" = 'b50e8400-0000-0000-0000-000000000008' WHERE "Id" = 'a50e8400-0000-0000-0000-000000000008';