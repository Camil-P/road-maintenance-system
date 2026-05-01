using Microsoft.EntityFrameworkCore;
using RoadMaintenance.Api.Features.WorkOrders.Contracts;
using RoadMaintenance.Domain.Entities;
using RoadMaintenance.Domain.Enums;
using RoadMaintenance.Infrastructure.Persistence;

namespace RoadMaintenance.Api.Features.WorkOrders;

public interface ICreateWorkOrderHandler
{
    Task<(bool Success, WorkOrderResponse? Response, string? Error)> HandleAsync(
        CreateWorkOrderRequest request,
        string userId);
}

public class CreateWorkOrderHandler : ICreateWorkOrderHandler
{
    private readonly AppDbContext _context;

    public CreateWorkOrderHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(bool Success, WorkOrderResponse? Response, string? Error)> HandleAsync(
        CreateWorkOrderRequest request,
        string userId)
    {
        if (!Guid.TryParse(userId, out var creatorGuid))
            return (false, null, "Invalid user ID.");

        if (request.IncidentId.HasValue)
        {
            var incident = await _context.IncidentReports
                .FirstOrDefaultAsync(i => i.Id == request.IncidentId.Value);

            if (incident is null) return (false, null, "Incident not found.");
            if (incident.Status != IncidentStatus.Verified)
                return (false, null, "Work order can be issued only for verified incidents.");
        }

        try
        {
            // 1. Create the base work order
            var workOrder = WorkOrder.Create(
                createdByUserId: creatorGuid,
                workType: request.WorkType,
                description: request.Description ?? "", 
                priority: request.Priority, 
                roadSegmentId: request.RoadSegmentId,
                incidentReportId: request.IncidentId,
                isEmergency: request.WorkType == WorkType.Other // Assuming 'Other' handles emergencies based on original code
            );

            // 2. If a date AND workers are provided, immediately schedule it
            if (request.ScheduledDate.HasValue && request.AssignedWorkerIds?.Any() == true)
            {
                workOrder.Schedule(request.AssignedWorkerIds, request.AssignedMachineIds, request.ScheduledDate.Value);
            }
            // If they provided a date but NO workers, reject the creation or just leave it as 'Created'
            else if (request.ScheduledDate.HasValue && (request.AssignedWorkerIds == null || !request.AssignedWorkerIds.Any()))
            {
                return (false, null, "At least one worker must be assigned to schedule the work order.");
            }

            _context.WorkOrders.Add(workOrder);
            await _context.SaveChangesAsync();

            // 3. Update related Incident if necessary
            if (request.IncidentId.HasValue)
            {
                var incident = await _context.IncidentReports
                    .FirstOrDefaultAsync(i => i.Id == request.IncidentId.Value);

                if (incident is not null)
                {
                    incident.AssignWorkOrder(workOrder.Id);
                    await _context.SaveChangesAsync();
                }
            }

            return (true, WorkOrderMapper.MapToResponse(workOrder), null);
        }
        catch (Exception ex) when (ex is ArgumentException || ex is InvalidOperationException)
        {
            return (false, null, ex.Message);
        }
    }
}