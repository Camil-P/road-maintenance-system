using Microsoft.EntityFrameworkCore;
using RoadMaintenance.Api.Features.RoadSegments.Contracts;
using RoadMaintenance.Infrastructure.Persistence;

namespace RoadMaintenance.Api.Features.RoadSegments;

public interface IUpdateRoadSegmentStatusHandler
{
    Task<(bool Success, RoadSegmentResponse? Response, string? Error)> HandleAsync(Guid id, UpdateRoadSegmentStatusRequest request);
}

public class UpdateRoadSegmentStatusHandler : IUpdateRoadSegmentStatusHandler
{
    private readonly AppDbContext _context;

    public UpdateRoadSegmentStatusHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(bool Success, RoadSegmentResponse? Response, string? Error)> HandleAsync(Guid id, UpdateRoadSegmentStatusRequest request)
    {
        var segment = await _context.RoadSegments.FirstOrDefaultAsync(r => r.Id == id);

        if (segment is null)
            return (false, null, "Road segment not found.");

        // Call the domain behavior method
        segment.UpdateStatus(request.Status);

        await _context.SaveChangesAsync();

        return (true, RoadSegmentMapper.MapToResponse(segment), null);
    }
}