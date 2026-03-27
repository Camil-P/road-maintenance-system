using Microsoft.EntityFrameworkCore;
using RoadMaintenance.Api.Features.Incidents.Contracts;
using RoadMaintenance.Infrastructure.Persistence;

namespace RoadMaintenance.Api.Features.Incidents;

/// <summary>
/// Handler for getting a single incident by ID.
/// </summary>
public interface IGetIncidentByIdHandler
{
    Task<IncidentResponse?> HandleAsync(Guid id);
}

public class GetIncidentByIdHandler : IGetIncidentByIdHandler
{
    private readonly AppDbContext _context;
    
    public GetIncidentByIdHandler(AppDbContext context)
    {
        _context = context;
    }
    
    public async Task<IncidentResponse?> HandleAsync(Guid id)
    {
        var incident = await _context.IncidentReports
            .AsNoTracking()
            .Include(i => i.RoadSegment)
            .FirstOrDefaultAsync(i => i.Id == id);
        
        if (incident is null)
            return null;
        
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
            HasPotentialDuplicates = false,
            PotentialDuplicateIds = null
        };
    }
}
