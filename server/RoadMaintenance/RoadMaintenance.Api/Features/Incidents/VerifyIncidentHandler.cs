using Microsoft.EntityFrameworkCore;
using RoadMaintenance.Api.Features.Incidents.Contracts;
using RoadMaintenance.Domain.Enums;
using RoadMaintenance.Infrastructure.Persistence;

namespace RoadMaintenance.Api.Features.Incidents;

public interface IVerifyIncidentHandler
{
    Task<(bool Success, IncidentResponse? Response, string? Error)> HandleAsync(Guid incidentId, string userId);
}

public class VerifyIncidentHandler : IVerifyIncidentHandler
{
    private readonly AppDbContext _context;

    public VerifyIncidentHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(bool Success, IncidentResponse? Response, string? Error)> HandleAsync(Guid incidentId, string userId)
    {
        var incident = await _context.IncidentReports
            .Include(i => i.RoadSegment)
            .FirstOrDefaultAsync(i => i.Id == incidentId);

        if (incident is null)
        {
            return (false, null, "Incident not found.");
        }

        try
        {
            incident.Verify(userId);
            await _context.SaveChangesAsync();

            return (true, IncidentResponseMapper.Map(incident), null);
        }
        catch (InvalidOperationException ex)
        {
            return (false, null, ex.Message);
        }
    }
}

internal static class IncidentResponseMapper
{
    public static IncidentResponse Map(Domain.Entities.IncidentReport incident)
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
            RoadSegmentName = incident.RoadSegment?.Name,
            ReportedByUserId = incident.ReportedByUserId,
            ReportedAt = incident.ReportedAt,
            VerifiedAt = incident.VerifiedAt,
            ResolvedAt = incident.ResolvedAt,
            HasPotentialDuplicates = incident.Status == IncidentStatus.Rejected && incident.RelatedIncidentId.HasValue,
            PotentialDuplicateIds = incident.RelatedIncidentId.HasValue ? [incident.RelatedIncidentId.Value] : null
        };
    }
}
