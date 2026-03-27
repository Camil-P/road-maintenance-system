using Microsoft.EntityFrameworkCore;
using RoadMaintenance.Api.Features.Incidents.Contracts; // For PaginatedResponse
using RoadMaintenance.Api.Features.RoadSegments.Contracts;
using RoadMaintenance.Infrastructure.Persistence;

namespace RoadMaintenance.Api.Features.RoadSegments;

public interface IGetRoadSegmentsHandler
{
    Task<PaginatedResponse<RoadSegmentResponse>> HandleAsync(GetRoadSegmentsQuery query);
}

public class GetRoadSegmentsHandler : IGetRoadSegmentsHandler
{
    private readonly AppDbContext _context;

    public GetRoadSegmentsHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResponse<RoadSegmentResponse>> HandleAsync(GetRoadSegmentsQuery query)
    {
        var segmentsQuery = _context.RoadSegments
            .AsNoTracking()
            .AsQueryable();

        // Apply filters
        if (query.Status.HasValue)
        {
            segmentsQuery = segmentsQuery.Where(r => r.Status == query.Status.Value);
        }

        if (query.Category.HasValue)
        {
            segmentsQuery = segmentsQuery.Where(r => r.Category == query.Category.Value);
        }

        var totalCount = await segmentsQuery.CountAsync();

        var segments = await segmentsQuery
            .OrderBy(r => r.Name)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        var items = segments.Select(RoadSegmentMapper.MapToResponse);

        return new PaginatedResponse<RoadSegmentResponse>
        {
            Items = items,
            TotalCount = totalCount,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }
}