using RoadMaintenance.Domain.Enums;
using RoadMaintenance.Domain.Interfaces;

namespace RoadMaintenance.Domain.Entities;

/// <summary>
/// Represents a work order for maintenance tasks.
/// Follows the status flow: Created → Scheduled → InProgress → Completed
/// </summary>
public class WorkOrder : IMustHaveTenant
{
    public Guid Id { get; private set; }
    public WorkType WorkType { get; private set; }
    public WorkOrderStatus Status { get; private set; }
    public int Priority { get; private set; }
    public string Description { get; private set; } = string.Empty;
    
    public Guid? RoadSegmentId { get; private set; }
    public RoadSegment? RoadSegment { get; private set; }
    
    public Guid? IncidentReportId { get; private set; }
    public Guid CreatedByUserId { get; private set; }
    
    public List<Guid> AssignedWorkerIds { get; private set; } = [];
    public List<Guid> AssignedMachineIds { get; private set; } = [];
    
    // New Assigned Materials Collection
    private readonly List<AssignedMaterial> _assignedMaterials = [];
    public IReadOnlyCollection<AssignedMaterial> AssignedMaterials => _assignedMaterials.AsReadOnly();
    
    public decimal? EstimatedCost { get; private set; }
    public decimal? ActualCost { get; private set; }
    public bool IsEmergency { get; private set; }
    public string? CompletionNotes { get; private set; }
    
    public Guid AgencyId { get; set; }
    public Agency Agency { get; set; } = null!;

    public DateTime CreatedAt { get; private set; }
    public DateTime? ScheduledFor { get; private set; }
    public DateTime? StartedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    
    public ICollection<IncidentReport> IncidentReports { get; private set; } = [];
    
    private WorkOrder() { }
    
    public static WorkOrder Create(
        WorkType workType,
        string description,
        Guid createdByUserId,
        int priority,
        Guid? roadSegmentId = null,
        Guid? incidentReportId = null,
        bool isEmergency = false,
        decimal? estimatedCost = null)
    {
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("Work order description is required.", nameof(description));
        if (createdByUserId == Guid.Empty)
            throw new ArgumentException("Creator user ID is required.", nameof(createdByUserId));
        if (priority < 1)
            throw new ArgumentException("Priority must be at least 1.", nameof(priority));
        
        return new WorkOrder
        {
            Id = Guid.NewGuid(),
            WorkType = workType,
            Status = WorkOrderStatus.Created,
            Priority = priority,
            Description = description,
            RoadSegmentId = roadSegmentId,
            IncidentReportId = incidentReportId,
            CreatedByUserId = createdByUserId,
            IsEmergency = isEmergency,
            EstimatedCost = estimatedCost,
            CreatedAt = DateTime.UtcNow
        };
    }
    
    public void Schedule(List<Guid> assignedWorkerIds, List<Guid>? assignedMachineIds, DateTime scheduledFor)
    {
        if (Status != WorkOrderStatus.Created)
            throw new InvalidOperationException($"Cannot schedule work order in status {Status}. Must be in Created status.");
        if (assignedWorkerIds == null || assignedWorkerIds.Count == 0)
            throw new ArgumentException("At least one assigned worker ID is required.", nameof(assignedWorkerIds));
        if (scheduledFor < DateTime.UtcNow)
            throw new ArgumentException("Scheduled date must be in the future.", nameof(scheduledFor));
        
        AssignedWorkerIds = assignedWorkerIds;
        AssignedMachineIds = assignedMachineIds ?? [];
        ScheduledFor = scheduledFor;
        Status = WorkOrderStatus.Scheduled;
    }

    // --- New Worker & Machine Management Methods ---

    /// <summary>
    /// Replaces the currently assigned workers with a new list.
    /// </summary>
    public void UpdateWorkers(List<Guid> newWorkerIds)
    {
        var distinctWorkerIds = newWorkerIds?.Distinct().ToList() ?? new List<Guid>();

        // Business rule: Active work orders must have at least one worker
        if (distinctWorkerIds.Count == 0 && Status is WorkOrderStatus.Scheduled or WorkOrderStatus.InProgress)
        {
            throw new InvalidOperationException($"Cannot remove all workers while work order is in {Status} status.");
        }

        AssignedWorkerIds = distinctWorkerIds;
    }

    public void AssignWorker(Guid workerId)
    {
        if (workerId == Guid.Empty) throw new ArgumentException("Worker ID cannot be empty.");
        if (!AssignedWorkerIds.Contains(workerId)) AssignedWorkerIds.Add(workerId);
    }

    public void RemoveWorker(Guid workerId)
    {
        AssignedWorkerIds.Remove(workerId);
        if (AssignedWorkerIds.Count == 0 && Status is WorkOrderStatus.Scheduled or WorkOrderStatus.InProgress)
        {
            throw new InvalidOperationException("Cannot remove the last worker from an active work order.");
        }
    }

    public void AssignMachine(Guid machineId)
    {
        if (machineId == Guid.Empty) throw new ArgumentException("Machine ID cannot be empty.");
        if (!AssignedMachineIds.Contains(machineId)) AssignedMachineIds.Add(machineId);
    }

    public void RemoveMachine(Guid machineId)
    {
        AssignedMachineIds.Remove(machineId);
    }

    // --- New Material Management Methods ---

    public void AddMaterial(Guid materialStockId, decimal quantity)
    {
        if (Status == WorkOrderStatus.Completed || Status == WorkOrderStatus.Cancelled)
            throw new InvalidOperationException("Cannot add materials to a completed or cancelled work order.");

        var existingMaterial = _assignedMaterials.FirstOrDefault(m => m.MaterialStockId == materialStockId);
        if (existingMaterial != null)
        {
            existingMaterial.UpdateQuantity(existingMaterial.Quantity + quantity);
        }
        else
        {
            _assignedMaterials.Add(AssignedMaterial.Create(Id, materialStockId, quantity));
        }
    }

    public void RemoveMaterial(Guid materialStockId)
    {
        if (Status == WorkOrderStatus.Completed || Status == WorkOrderStatus.Cancelled)
            throw new InvalidOperationException("Cannot modify materials on a completed or cancelled work order.");

        var material = _assignedMaterials.FirstOrDefault(m => m.MaterialStockId == materialStockId);
        if (material != null)
        {
            _assignedMaterials.Remove(material);
        }
    }

    // --- Existing Lifecycle Methods ---

    public void StartWork()
    {
        if (Status != WorkOrderStatus.Scheduled)
            throw new InvalidOperationException($"Cannot start work in status {Status}. Must be in Scheduled status.");
        
        Status = WorkOrderStatus.InProgress;
        StartedAt = DateTime.UtcNow;
    }
    
    public void Complete(decimal? actualCost = null, string? completionNotes = null)
    {
        if (Status != WorkOrderStatus.InProgress)
            throw new InvalidOperationException($"Cannot complete work order in status {Status}. Must be in InProgress status.");
        
        Status = WorkOrderStatus.Completed;
        ActualCost = actualCost;
        CompletionNotes = completionNotes;
        CompletedAt = DateTime.UtcNow;
    }
    
    public void Cancel()
    {
        if (Status == WorkOrderStatus.Completed)
            throw new InvalidOperationException("Cannot cancel a completed work order.");
        
        Status = WorkOrderStatus.Cancelled;
    }
    
    public void UpdatePriority(int newPriority)
    {
        if (newPriority < 1)
            throw new ArgumentException("Priority must be at least 1.", nameof(newPriority));
        
        Priority = newPriority;
    }

    public void AddActualCost(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be positive.", nameof(amount));

        ActualCost = (ActualCost ?? 0) + amount;
    }
}