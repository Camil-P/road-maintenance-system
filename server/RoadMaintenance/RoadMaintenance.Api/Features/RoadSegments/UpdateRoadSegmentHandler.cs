using Microsoft.EntityFrameworkCore;
using RoadMaintenance.Api.Features.RoadSegments.Contracts;
using RoadMaintenance.Infrastructure.Persistence;

namespace RoadMaintenance.Api.Features.RoadSegments;

public interface IUpdateRoadSegmentHandler
{
    Task<(bool Success, RoadSegmentResponse? Response, string? Error)> HandleAsync(Guid id, UpdateRoadSegmentRequest request);
}

public class UpdateRoadSegmentHandler : IUpdateRoadSegmentHandler
{
    private readonly AppDbContext _context;

    public UpdateRoadSegmentHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(bool Success, RoadSegmentResponse? Response, string? Error)> HandleAsync(Guid id, UpdateRoadSegmentRequest request)
    {
        var segment = await _context.RoadSegments.FirstOrDefaultAsync(r => r.Id == id);

        if (segment is null)
            return (false, null, "Road segment not found.");

        try
        {
            // Call the domain behavior method
            segment.Update(
                name: request.Name,
                category: request.Category,
                lengthKm: request.LengthKm,
                description: request.Description
            );

            await _context.SaveChangesAsync();

            return (true, RoadSegmentMapper.MapToResponse(segment), null);
        }
        catch (ArgumentException ex)
        {
            return (false, null, ex.Message);
        }
    }
}