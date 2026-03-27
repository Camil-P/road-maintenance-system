using Microsoft.EntityFrameworkCore;
using RoadMaintenance.Api.Features.Incidents.Contracts;
using RoadMaintenance.Infrastructure.Persistence;

namespace RoadMaintenance.Api.Features.Incidents;

public interface IMarkIncidentAsDuplicateHandler
{
    Task<(bool Success, IncidentResponse? Response, string? Error)> HandleAsync(Guid incidentId, Guid relatedIncidentId, string userId);
}

public class MarkIncidentAsDuplicateHandler : IMarkIncidentAsDuplicateHandler
{
    private readonly AppDbContext _context;

    public MarkIncidentAsDuplicateHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(bool Success, IncidentResponse? Response, string? Error)> HandleAsync(Guid incidentId, Guid relatedIncidentId, string userId)
    {
        if (incidentId == relatedIncidentId)
        {
            return (false, null, "Incident cannot be marked as duplicate of itself.");
        }

        var incident = await _context.IncidentReports
            .Include(i => i.RoadSegment)
            .FirstOrDefaultAsync(i => i.Id == incidentId);

        if (incident is null)
        {
            return (false, null, "Incident not found.");
        }

        var relatedExists = await _context.IncidentReports
            .AsNoTracking()
            .AnyAsync(i => i.Id == relatedIncidentId);

        if (!relatedExists)
        {
            return (false, null, "Related incident not found.");
        }

        try
        {
            incident.MarkAsDuplicate(relatedIncidentId, userId);
            await _context.SaveChangesAsync();

            return (true, IncidentResponseMapper.Map(incident), null);
        }
        catch (InvalidOperationException ex)
        {
            return (false, null, ex.Message);
        }
    }
}
