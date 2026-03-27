using Microsoft.EntityFrameworkCore;
using RoadMaintenance.Api.Features.RoadSegments.Contracts;
using RoadMaintenance.Infrastructure.Persistence;

namespace RoadMaintenance.Api.Features.RoadSegments;

public interface IGetRoadSegmentByIdHandler
{
    Task<RoadSegmentResponse?> HandleAsync(Guid id);
}

public class GetRoadSegmentByIdHandler : IGetRoadSegmentByIdHandler
{
    private readonly AppDbContext _context;

    public GetRoadSegmentByIdHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<RoadSegmentResponse?> HandleAsync(Guid id)
    {
        var segment = await _context.RoadSegments
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id);

        if (segment is null)
            return null;

        return RoadSegmentMapper.MapToResponse(segment);
    }
}