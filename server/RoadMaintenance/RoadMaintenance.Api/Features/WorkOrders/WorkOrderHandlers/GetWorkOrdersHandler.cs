using Microsoft.EntityFrameworkCore;
using RoadMaintenance.Api.Features.Incidents.Contracts; 
using RoadMaintenance.Api.Features.WorkOrders.Contracts;
using RoadMaintenance.Infrastructure.Persistence;

namespace RoadMaintenance.Api.Features.WorkOrders;

public interface IGetWorkOrdersHandler
{
    Task<PaginatedResponse<WorkOrderResponse>> HandleAsync(GetWorkOrdersQuery query);
}

public class GetWorkOrdersHandler : IGetWorkOrdersHandler
{
    private readonly AppDbContext _context;

    public GetWorkOrdersHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResponse<WorkOrderResponse>> HandleAsync(GetWorkOrdersQuery query)
    {
        var workOrdersQuery = _context.WorkOrders
            .AsNoTracking()
            .AsQueryable();

        // Apply filters
        if (query.Status.HasValue)
        {
            workOrdersQuery = workOrdersQuery.Where(w => w.Status == query.Status.Value);
        }

        if (query.RoadSegmentId.HasValue)
        {
            workOrdersQuery = workOrdersQuery.Where(w => w.RoadSegmentId == query.RoadSegmentId.Value);
        }

        if (query.AssignedWorkerId.HasValue)
        {
            // Supported natively in EF Core 8+ with primitive collections
            workOrdersQuery = workOrdersQuery.Where(w => w.AssignedWorkerIds.Contains(query.AssignedWorkerId.Value));
        }

        var totalCount = await workOrdersQuery.CountAsync();

        var workOrders = await workOrdersQuery
            .OrderByDescending(w => w.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Include(x => x.RoadSegment)
            .Include(x => x.AssignedMaterials) // Include materials in list
            .ToListAsync();

        var items = workOrders.Select(WorkOrderMapper.MapToResponse);

        return new PaginatedResponse<WorkOrderResponse>
        {
            Items = items,
            TotalCount = totalCount,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }
}