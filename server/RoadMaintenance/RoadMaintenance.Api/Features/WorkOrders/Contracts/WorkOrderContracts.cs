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

    public string? Description { get; set; } = "";
    public int Priority { get; set; } = 2;

    // Optional fields for immediate scheduling and assignment during creation
    public DateTime? ScheduledDate { get; set; }
    public List<Guid>? AssignedWorkerIds { get; set; }
    public List<Guid>? AssignedMachineIds { get; set; }
}

public class UpdateWorkOrderStatusRequest
{
    [Required]
    [ValidWorkOrderStatus]
    public WorkOrderStatus Status { get; set; }
    
    // Additional fields needed when status transitions to Scheduled
    public List<Guid>? AssignedWorkerIds { get; set; }
    public List<Guid>? AssignedMachineIds { get; set; }
    public DateTime? ScheduledDate { get; set; }
}

public class AssignedMaterialResponse
{
    public Guid MaterialStockId { get; set; }
    public decimal Quantity { get; set; }
}

public class WorkOrderResponse
{
    public Guid Id { get; set; }
    public Guid? IncidentId { get; set; }      
    public Guid? RoadSegmentId { get; set; }
    public string? RoadSegmentName { get; set; }
    public RoadCategory? RoadSegmentCategory { get; set; }
    public WorkType WorkType { get; set; }
    public string WorkTypeName { get; set; } = string.Empty;
    public WorkOrderStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty; 
    
    // Updated properties
    public List<Guid> AssignedWorkerIds { get; set; } = [];
    public List<Guid> AssignedMachineIds { get; set; } = [];
    public List<AssignedMaterialResponse> AssignedMaterials { get; set; } = [];
    
    public DateTime? ScheduledDate { get; set; } 
    public DateTime CreatedAt { get; set; }
}

public class GetWorkOrdersQuery
{
    public WorkOrderStatus? Status { get; set; }
    public Guid? RoadSegmentId { get; set; }
    public Guid? AssignedWorkerId { get; set; } // Changed from string AssignedToUserId
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
            IncidentId = workOrder.IncidentReportId, 
            RoadSegmentId = workOrder.RoadSegmentId,
            RoadSegmentName = workOrder.RoadSegment?.Name, 
            RoadSegmentCategory = workOrder.RoadSegment?.Category,
            WorkType = workOrder.WorkType,
            WorkTypeName = workOrder.WorkType.ToString(),
            Status = workOrder.Status,
            StatusName = workOrder.Status.ToString(),
            Priority = workOrder.Priority.ToString(), 
            AssignedWorkerIds = workOrder.AssignedWorkerIds,
            AssignedMachineIds = workOrder.AssignedMachineIds,
            AssignedMaterials = workOrder.AssignedMaterials.Select(m => new AssignedMaterialResponse 
            {
                MaterialStockId = m.MaterialStockId,
                Quantity = m.Quantity
            }).ToList(),
            ScheduledDate = workOrder.ScheduledFor, 
            CreatedAt = workOrder.CreatedAt
        };
    }
}