using Microsoft.EntityFrameworkCore;
using RoadMaintenance.Infrastructure.Persistence;

namespace RoadMaintenance.Api.Features.WorkOrders;

public interface IUpdateWorkOrderWorkersHandler
{
    Task<(bool Success, string? Error)> HandleAsync(Guid workOrderId, List<Guid> workerIds);
}

public class UpdateWorkOrderWorkersHandler : IUpdateWorkOrderWorkersHandler
{
    private readonly AppDbContext _context;

    public UpdateWorkOrderWorkersHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(bool Success, string? Error)> HandleAsync(Guid workOrderId, List<Guid> workerIds)
    {
        var workOrder = await _context.WorkOrders
            .FirstOrDefaultAsync(w => w.Id == workOrderId);

        if (workOrder is null)
        {
            return (false, "Work order not found.");
        }

        try
        {
            // Call the domain behavior to sync the list
            workOrder.UpdateWorkers(workerIds);

            await _context.SaveChangesAsync();
            return (true, null);
        }
        catch (InvalidOperationException ex)
        {
            // Catches domain rule violations (e.g. removing all workers when Scheduled)
            return (false, ex.Message);
        }
    }
}