using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using RoadMaintenance.Api.Features.Incidents.Contracts;
using RoadMaintenance.Domain.Entities;
using RoadMaintenance.Domain.Enums;
using RoadMaintenance.Domain.Services;
using RoadMaintenance.Infrastructure.Persistence;

namespace RoadMaintenance.Api.Features.Incidents;

/// <summary>
/// Handler for creating new incident reports.
/// Follows SRP: one use case, one handler.
/// </summary>
public interface ICreateIncidentHandler
{
    Task<(bool Success, IncidentResponse? Response, string? Error, IReadOnlyList<Guid>? PotentialDuplicates)> HandleAsync(
        CreateIncidentRequest request,
        string userId);
}

public class CreateIncidentHandler : ICreateIncidentHandler
{
    private readonly AppDbContext _context;
    private readonly ILocationService _locationService;
    private readonly IncidentDuplicateDetectionOptions _duplicateDetectionOptions;
    
    public CreateIncidentHandler(
        AppDbContext context,
        ILocationService locationService,
        IOptions<IncidentDuplicateDetectionOptions> duplicateDetectionOptions)
    {
        _context = context;
        _locationService = locationService;
        _duplicateDetectionOptions = duplicateDetectionOptions.Value;
    }
    
    public async Task<(bool Success, IncidentResponse? Response, string? Error, IReadOnlyList<Guid>? PotentialDuplicates)> HandleAsync(
        CreateIncidentRequest request,
        string userId)
    {
        // Validate road segment if provided
        RoadSegment? roadSegment = null;
        if (request.RoadSegmentId.HasValue)
        {
            roadSegment = await _context.RoadSegments
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.Id == request.RoadSegmentId.Value);
            
            if (roadSegment is null)
            {
                return (false, null, "Road segment not found.", null);
            }
        }
        
        // Create the incident entity
        var incident = IncidentReport.Create(
            type: request.Type,
            description: request.Description,
            reportedByUserId: userId,
            latitude: request.Latitude,
            longitude: request.Longitude,
            locationDescription: request.LocationDescription,
            roadSegmentId: request.RoadSegmentId,
            geometryJson: request.GeometryJson);
        
        // Check for potential duplicates using the location service
        IReadOnlyList<Guid> potentialDuplicates = [];
        if (incident.HasCoordinates)
        {
            var recentIncidents = await _context.IncidentReports
                .AsNoTracking()
                .Where(i => 
                    i.Status != IncidentStatus.Resolved &&
                    i.Status != IncidentStatus.Rejected &&
                    i.ReportedAt >= DateTime.UtcNow.AddHours(-_duplicateDetectionOptions.TimeWindowHours))
                .ToListAsync();
            
            potentialDuplicates = _locationService.FindPotentialDuplicates(
                incident,
                recentIncidents,
                radiusMeters: _duplicateDetectionOptions.RadiusMeters,
                timeWindowHours: _duplicateDetectionOptions.TimeWindowHours);
        }
        
        // Save the incident (we save it even if there are duplicates, but flag it)
        _context.IncidentReports.Add(incident);
        await _context.SaveChangesAsync();
        
        // Map to response
        var response = MapToResponse(incident, roadSegment?.Name, potentialDuplicates);
        
        return (true, response, null, potentialDuplicates.Count > 0 ? potentialDuplicates : null);
    }
    
    private static IncidentResponse MapToResponse(
        IncidentReport incident,
        string? roadSegmentName,
        IReadOnlyList<Guid>? potentialDuplicates)
    {
        return new IncidentResponse
        {
            Id = incident.Id,
            Type = incident.Type,
            TypeName = incident.Type.ToString(),
            Status = incident.Status,
            StatusName = incident.Status.ToString(),
            Description = incident.Description,
            Latitude = incident.Latitude,
            Longitude = incident.Longitude,
            LocationDescription = incident.LocationDescription,
            RoadSegmentId = incident.RoadSegmentId,
            RoadSegmentName = roadSegmentName,
            ReportedByUserId = incident.ReportedByUserId,
            ReportedAt = incident.ReportedAt,
            VerifiedAt = incident.VerifiedAt,
            ResolvedAt = incident.ResolvedAt,
            GeometryJson = incident.GeometryJson,
            HasPotentialDuplicates = potentialDuplicates?.Count > 0,
            PotentialDuplicateIds = potentialDuplicates
        };
    }
}
