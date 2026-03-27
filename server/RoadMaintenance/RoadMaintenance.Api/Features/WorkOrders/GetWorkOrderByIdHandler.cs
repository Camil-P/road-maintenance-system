using Microsoft.EntityFrameworkCore;
using RoadMaintenance.Api.Features.WorkOrders.Contracts;
using RoadMaintenance.Infrastructure.Persistence;

namespace RoadMaintenance.Api.Features.WorkOrders;

public interface IGetWorkOrderByIdHandler
{
    Task<WorkOrderResponse?> HandleAsync(Guid id);
}

public class GetWorkOrderByIdHandler : IGetWorkOrderByIdHandler
{
    private readonly AppDbContext _context;

    public GetWorkOrderByIdHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<WorkOrderResponse?> HandleAsync(Guid id)
    {
        var workOrder = await _context.WorkOrders
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.Id == id);

        if (workOrder is null)
            return null;

        return WorkOrderMapper.MapToResponse(workOrder);
    }
}