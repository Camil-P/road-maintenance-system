using Microsoft.EntityFrameworkCore;
using RoadMaintenance.Domain.Enums;
using RoadMaintenance.Infrastructure.Persistence;
using RoadMaintenance.Domain.Entities;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace RoadMaintenance.Api.Features.Map;

public interface IMapHandler
{
    Task<JsonObject> GetGeoJsonAsync();
}

public class MapHandler : IMapHandler
{
    private readonly AppDbContext _context;

    public MapHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<JsonObject> GetGeoJsonAsync()
    {
        var roadSegments = await _context.RoadSegments.AsNoTracking().ToListAsync();
        var incidents = await _context.IncidentReports.AsNoTracking().ToListAsync();
        var workOrders = await _context.WorkOrders
            .AsNoTracking()
            .Include(w => w.RoadSegment)
            .Where(w => w.Status != WorkOrderStatus.Completed && w.Status != WorkOrderStatus.Cancelled)
            .ToListAsync();

        var features = new JsonArray();

        // Road segments
        foreach (var seg in roadSegments)
        {
            JsonNode? geometry = null;

            if (!string.IsNullOrEmpty(seg.GeometryJson))
            {
                geometry = JsonNode.Parse(seg.GeometryJson);
            }
            else if (seg.StartLatitude.HasValue && seg.StartLongitude.HasValue &&
                     seg.EndLatitude.HasValue && seg.EndLongitude.HasValue)
            {
                geometry = new JsonObject
                {
                    ["type"] = "LineString",
                    ["coordinates"] = new JsonArray
                    {
                        new JsonArray { (JsonNode)seg.StartLongitude.Value, (JsonNode)seg.StartLatitude.Value },
                        new JsonArray { (JsonNode)seg.EndLongitude.Value, (JsonNode)seg.EndLatitude.Value }
                    }
                };
            }

            if (geometry is null) continue;

            features.Add(new JsonObject
            {
                ["type"] = "Feature",
                ["geometry"] = geometry,
                ["properties"] = new JsonObject
                {
                    ["id"] = seg.Id.ToString(),
                    ["layerType"] = "road-segment",
                    ["name"] = seg.Name,
                    ["category"] = seg.Category.ToString(),
                    ["status"] = seg.Status.ToString(),
                    ["lengthKm"] = (JsonNode)seg.LengthKm
                }
            });
        }

        // Incidents
        foreach (var inc in incidents)
        {
            JsonNode? incGeometry = null;

            if (!string.IsNullOrEmpty(inc.GeometryJson))
            {
                incGeometry = JsonNode.Parse(inc.GeometryJson);
            }
            else if (inc.HasCoordinates)
            {
                incGeometry = new JsonObject
                {
                    ["type"] = "Point",
                    ["coordinates"] = new JsonArray { (JsonNode)inc.Longitude!.Value, (JsonNode)inc.Latitude!.Value }
                };
            }

            if (incGeometry is null) continue;

            var geomType = incGeometry["type"]?.GetValue<string>();

            features.Add(new JsonObject
            {
                ["type"] = "Feature",
                ["geometry"] = incGeometry,
                ["properties"] = new JsonObject
                {
                    ["id"] = inc.Id.ToString(),
                    ["layerType"] = geomType == "LineString" ? "incident-line" : "incident",
                    ["type"] = inc.Type.ToString(),
                    ["status"] = inc.Status.ToString(),
                    ["description"] = inc.Description,
                    ["locationDescription"] = inc.LocationDescription,
                    ["reportedAt"] = inc.ReportedAt.ToString("o")
                }
            });
        }

        // Active work zones
        foreach (var wo in workOrders)
        {
            JsonNode? geometry = null;

            if (!string.IsNullOrEmpty(wo.WorkZoneGeometryJson))
            {
                geometry = JsonNode.Parse(wo.WorkZoneGeometryJson);
            }
            else if (wo.RoadSegment is not null)
            {
                // Fall back to full road segment geometry
                if (!string.IsNullOrEmpty(wo.RoadSegment.GeometryJson))
                {
                    geometry = JsonNode.Parse(wo.RoadSegment.GeometryJson);
                }
                else if (wo.RoadSegment.StartLatitude.HasValue && wo.RoadSegment.StartLongitude.HasValue &&
                         wo.RoadSegment.EndLatitude.HasValue && wo.RoadSegment.EndLongitude.HasValue)
                {
                    geometry = new JsonObject
                    {
                        ["type"] = "LineString",
                        ["coordinates"] = new JsonArray
                        {
                            new JsonArray { (JsonNode)wo.RoadSegment.StartLongitude.Value, (JsonNode)wo.RoadSegment.StartLatitude.Value },
                            new JsonArray { (JsonNode)wo.RoadSegment.EndLongitude.Value, (JsonNode)wo.RoadSegment.EndLatitude.Value }
                        }
                    };
                }
            }

            if (geometry is null) continue;

            features.Add(new JsonObject
            {
                ["type"] = "Feature",
                ["geometry"] = geometry,
                ["properties"] = new JsonObject
                {
                    ["id"] = wo.Id.ToString(),
                    ["layerType"] = "work-zone",
                    ["workType"] = wo.WorkType.ToString(),
                    ["status"] = wo.Status.ToString(),
                    ["priority"] = wo.Priority,
                    ["affectedLane"] = wo.AffectedLane?.ToString(),
                    ["workZoneStartMeters"] = wo.WorkZoneStartMeters.HasValue ? (JsonNode)wo.WorkZoneStartMeters.Value : null,
                    ["workZoneEndMeters"] = wo.WorkZoneEndMeters.HasValue ? (JsonNode)wo.WorkZoneEndMeters.Value : null,
                    ["description"] = wo.Description,
                    ["roadSegmentName"] = wo.RoadSegment?.Name
                }
            });
        }

        // Work Zones (new entity)
        var workZones = await _context.WorkZones
            .AsNoTracking()
            .Where(wz => wz.Status != WorkZoneStatus.Completed)
            .ToListAsync();

        foreach (var wz in workZones)
        {
            var wzGeometry = JsonNode.Parse(wz.GeometryJson);
            if (wzGeometry is null) continue;

            features.Add(new JsonObject
            {
                ["type"] = "Feature",
                ["geometry"] = wzGeometry,
                ["properties"] = new JsonObject
                {
                    ["id"] = wz.Id.ToString(),
                    ["layerType"] = "work-zone",
                    ["name"] = wz.Name,
                    ["status"] = wz.Status.ToString(),
                    ["affectedLane"] = wz.AffectedLane.ToString(),
                    ["originalLengthMeters"] = wz.OriginalLengthMeters,
                    ["remainingLengthMeters"] = wz.RemainingLengthMeters,
                    ["progressPercent"] = wz.OriginalLengthMeters > 0
                        ? Math.Round((wz.OriginalLengthMeters - wz.RemainingLengthMeters) / wz.OriginalLengthMeters * 100, 1)
                        : 0
                }
            });
        }

        return new JsonObject
        {
            ["type"] = "FeatureCollection",
            ["features"] = features
        };
    }
}
