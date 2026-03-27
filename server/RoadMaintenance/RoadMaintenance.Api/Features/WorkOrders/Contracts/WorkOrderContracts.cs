using RoadMaintenance.Api.Features.WorkOrders.Contracts.Validations;
using RoadMaintenance.Domain.Entities;
using RoadMaintenance.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace RoadMaintenance.Api.Features.WorkOrders.Contracts;

public class CreateWorkOrderRequest
{
    public Guid? IncidentId { get; set; }
    public Guid? RoadSegmentId { get; set; }

    [Required]
    [ValidWorkType]
    public WorkType WorkType { get; set; }

    public DateTime? ScheduledDate { get; set; }
    public string? Description { get; set; } = "";
    public int Priority { get; set; } = 2;
}

public class UpdateWorkOrderStatusRequest
{
    [Required]
    [ValidWorkOrderStatus]
    public WorkOrderStatus Status { get; set; }
}

public class WorkOrderResponse
{
    public Guid Id { get; set; }
    public Guid? IncidentId { get; set; }      // Maps to domain's IncidentReportId
    public Guid? RoadSegmentId { get; set; }
    public string? RoadSegmentName { get; set; }
    public RoadCategory? RoadSegmentCategory { get; set; }
    public WorkType WorkType { get; set; }
    public string WorkTypeName { get; set; } = string.Empty;
    public WorkOrderStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty; // Frontend expects string
    public string? AssignedToUserId { get; set; }
    public DateTime? ScheduledDate { get; set; } // Maps to domain's ScheduledFor
    public DateTime CreatedAt { get; set; }
}

public class GetWorkOrdersQuery
{
    public WorkOrderStatus? Status { get; set; }
    public Guid? RoadSegmentId { get; set; }
    public string? AssignedToUserId { get; set; }
    [Range(1, int.MaxValue)] public int Page { get; set; } = 1;
    [Range(1, 100)] public int PageSize { get; set; } = 20;
}

public static class WorkOrderMapper
{
    public static WorkOrderResponse MapToResponse(WorkOrder workOrder)
    {
        return new WorkOrderResponse
        {
            Id = workOrder.Id,
            IncidentId = workOrder.IncidentReportId, // Map from DB to DTO
            RoadSegmentId = workOrder.RoadSegmentId,
            RoadSegmentName = workOrder.RoadSegment?.Name, 
            RoadSegmentCategory = workOrder.RoadSegment?.Category,
            WorkType = workOrder.WorkType,
            WorkTypeName = workOrder.WorkType.ToString(),
            Status = workOrder.Status,
            StatusName = workOrder.Status.ToString(),
            Priority = workOrder.Priority.ToString(), // Map int to string for frontend
            AssignedToUserId = workOrder.AssignedToUserId,
            ScheduledDate = workOrder.ScheduledFor, // Map from DB to DTO
            CreatedAt = workOrder.CreatedAt
        };
    }
}