using Microsoft.EntityFrameworkCore;
using RoadMaintenance.Api.Features.Incidents.Contracts;
using RoadMaintenance.Infrastructure.Persistence;

namespace RoadMaintenance.Api.Features.Incidents;

public interface IResolveIncidentHandler
{
    Task<(bool Success, IncidentResponse? Response, string? Error)> HandleAsync(Guid incidentId);
}

public class ResolveIncidentHandler : IResolveIncidentHandler
{
    private readonly AppDbContext _context;

    public ResolveIncidentHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(bool Success, IncidentResponse? Response, string? Error)> HandleAsync(Guid incidentId)
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
            incident.Resolve();
            await _context.SaveChangesAsync();

            return (true, IncidentResponseMapper.Map(incident), null);
        }
        catch (InvalidOperationException ex)
        {
            return (false, null, ex.Message);
        }
    }
}
