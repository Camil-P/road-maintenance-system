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
            .Include(w => w.RoadSegment)
            .Include(w => w.AssignedMaterials)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (workOrder is null)
            return (false, null, "Work order not found.");

        try
        {
            switch (request.Status)
            {
                case WorkOrderStatus.Scheduled:
                    if (request.AssignedWorkerIds == null || request.AssignedWorkerIds.Count == 0)
                        return (false, null, "At least one assigned worker is required to schedule a work order.");
                        
                    if (!request.ScheduledDate.HasValue)
                        return (false, null, "A scheduled date is required.");
                        
                    workOrder.Schedule(request.AssignedWorkerIds, request.AssignedMachineIds, request.ScheduledDate.Value);
                    break;

                case WorkOrderStatus.InProgress:
                    workOrder.StartWork();
                    break;

                case WorkOrderStatus.Completed:
                    // Note: You can extend this endpoint or create a separate one to accept actual cost & notes
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
                    return (false, null, "Cannot revert status back to Created.");
            }

            await _context.SaveChangesAsync();
            return (true, WorkOrderMapper.MapToResponse(workOrder), null);
        }
        catch (InvalidOperationException ex)
        {
            return (false, null, ex.Message);
        }
        catch (ArgumentException ex)
        {
            return (false, null, ex.Message);
        }
    }
}