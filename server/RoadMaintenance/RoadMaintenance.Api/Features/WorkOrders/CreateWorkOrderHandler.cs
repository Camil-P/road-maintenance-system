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
        if (request.IncidentId.HasValue)
        {
            var incident = await _context.IncidentReports
                .FirstOrDefaultAsync(i => i.Id == request.IncidentId.Value);

            if (incident is null)
            {
                return (false, null, "Incident not found.");
            }

            if (incident.Status != IncidentStatus.Verified)
            {
                return (false, null, "Work order can be issued only for verified incidents.");
            }
        }

        // Use the factory method from your domain model
        var workOrder = WorkOrder.Create(
            createdByUserId: userId,
            workType: request.WorkType,
            description: request.Description ?? "",
            priority: request.Priority,
            roadSegmentId: request.RoadSegmentId,
            incidentReportId: request.IncidentId,
            isEmergency: request.WorkType == WorkType.Other,
            workZoneStartMeters: request.WorkZoneStartMeters,
            workZoneEndMeters: request.WorkZoneEndMeters,
            affectedLane: request.AffectedLane,
            workZoneGeometryJson: request.WorkZoneGeometryJson
        );

        // If a scheduled date is provided upfront, we can optionally schedule it immediately
        // Note: Your Schedule method requires an assigned user, so you might need to handle this
        // in a separate assignment endpoint depending on your business rules.

        _context.WorkOrders.Add(workOrder);
        await _context.SaveChangesAsync();

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

}