using Microsoft.EntityFrameworkCore;
using RoadMaintenance.Api.Features.WorkOrders.Contracts;
using RoadMaintenance.Domain.Enums;
using RoadMaintenance.Infrastructure.Persistence;

namespace RoadMaintenance.Api.Features.WorkOrders;

public interface IUpdateWorkOrderStatusHandler
{
    Task<(bool Success, WorkOrderResponse? Response, string? Error)> HandleAsync(
        Guid id,
        UpdateWorkOrderStatusRequest request,
        string userId);
}

public class UpdateWorkOrderStatusHandler : IUpdateWorkOrderStatusHandler
{
    private readonly AppDbContext _context;

    public UpdateWorkOrderStatusHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(bool Success, WorkOrderResponse? Response, string? Error)> HandleAsync(
        Guid id,
        UpdateWorkOrderStatusRequest request,
        string userId)
    {
        var workOrder = await _context.WorkOrders
            .FirstOrDefaultAsync(w => w.Id == id);

        if (workOrder is null)
            return (false, null, "Work order not found.");

        try
        {
            // Call the correct domain behavior based on the requested status
            switch (request.Status)
            {
                case WorkOrderStatus.Scheduled:
                    // Using userId as a fallback assignee if none was provided yet
                    workOrder.Schedule(userId, DateTime.UtcNow.AddDays(1));
                    break;

                case WorkOrderStatus.InProgress:
                    workOrder.StartWork();
                    break;

                case WorkOrderStatus.Completed:
                    workOrder.Complete();

                    if (workOrder.IncidentReportId.HasValue)
                    {
                        var incident = await _context.IncidentReports
                            .FirstOrDefaultAsync(i => i.Id == workOrder.IncidentReportId.Value);

                        if (incident is not null && incident.Status == IncidentStatus.WorkOrderIssued)
                        {
                            incident.Resolve();
                        }
                    }
                    break;

                case WorkOrderStatus.Cancelled:
                    workOrder.Cancel();
                    break;

                case WorkOrderStatus.Created:
                    // Cannot revert back to created in your domain model
                    return (false, null, "Cannot revert status back to Created.");
            }

            await _context.SaveChangesAsync();
            return (true, WorkOrderMapper.MapToResponse(workOrder), null);
        }
        catch (InvalidOperationException ex)
        {
            // Catches domain rule violations (e.g. trying to complete an already completed order)
            return (false, null, ex.Message);
        }
    }
}