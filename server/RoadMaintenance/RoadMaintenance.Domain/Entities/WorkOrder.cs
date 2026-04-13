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
    
    /// <summary>
    /// Type of maintenance work to be performed
    /// </summary>
    public WorkType WorkType { get; private set; }
    
    /// <summary>
    /// Current status in the work order workflow
    /// </summary>
    public WorkOrderStatus Status { get; private set; }
    
    /// <summary>
    /// Priority level (1 = highest, higher numbers = lower priority)
    /// Calculated based on road category and incident type
    /// </summary>
    public int Priority { get; private set; }
    
    /// <summary>
    /// Detailed description of the work to be performed
    /// </summary>
    public string Description { get; private set; } = string.Empty;
    
    /// <summary>
    /// Reference to the road segment where work will be performed
    /// </summary>
    public Guid? RoadSegmentId { get; private set; }
    public RoadSegment? RoadSegment { get; private set; }
    
    /// <summary>
    /// Reference to the incident report that triggered this work order (if any)
    /// </summary>
    public Guid? IncidentReportId { get; private set; }
    
    /// <summary>
    /// ID of the user who created the work order
    /// </summary>
    public string CreatedByUserId { get; private set; } = string.Empty;
    
    /// <summary>
    /// ID of the field worker assigned to this work order
    /// </summary>
    public string? AssignedToUserId { get; private set; }
    
    /// <summary>
    /// Estimated cost for this work order
    /// </summary>
    public decimal? EstimatedCost { get; private set; }
    
    /// <summary>
    /// Actual cost after completion
    /// </summary>
    public decimal? ActualCost { get; private set; }
    
    /// <summary>
    /// Whether this is emergency maintenance (affects budget categorization)
    /// </summary>
    public bool IsEmergency { get; private set; }
    
    /// <summary>
    /// Notes added by the field worker during or after completion
    /// </summary>
    public string? CompletionNotes { get; private set; }
    
    /// <summary>
    /// ID of the agency responsible for handling this work order. 
    /// This is determined based on the work order location and agency jurisdiction areas.
    /// </summary>
    public Guid? AgencyId { get; set; }
    public Agency? Agency { get; set; }
    
    public DateTime CreatedAt { get; private set; }
    public DateTime? ScheduledFor { get; private set; }
    public DateTime? StartedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    
    // Navigation property for incident reports linked to this work order
    public ICollection<IncidentReport> IncidentReports { get; private set; } = [];
    
    // Private constructor for EF Core
    private WorkOrder() { }
    
    public static WorkOrder Create(
        WorkType workType,
        string description,
        string createdByUserId,
        int priority,
        Guid? roadSegmentId = null,
        Guid? incidentReportId = null,
        bool isEmergency = false,
        decimal? estimatedCost = null)
    {
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("Work order description is required.", nameof(description));
        
        if (string.IsNullOrWhiteSpace(createdByUserId))
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
    
    /// <summary>
    /// Assigns a field worker and schedules the work order.
    /// </summary>
    public void Schedule(string assignedToUserId, DateTime scheduledFor)
    {
        if (Status != WorkOrderStatus.Created)
            throw new InvalidOperationException($"Cannot schedule work order in status {Status}. Must be in Created status.");
        
        if (string.IsNullOrWhiteSpace(assignedToUserId))
            throw new ArgumentException("Assigned user ID is required.", nameof(assignedToUserId));
        
        if (scheduledFor < DateTime.UtcNow)
            throw new ArgumentException("Scheduled date must be in the future.", nameof(scheduledFor));
        
        AssignedToUserId = assignedToUserId;
        ScheduledFor = scheduledFor;
        Status = WorkOrderStatus.Scheduled;
    }
    
    /// <summary>
    /// Field worker starts work on the order.
    /// </summary>
    public void StartWork()
    {
        if (Status != WorkOrderStatus.Scheduled)
            throw new InvalidOperationException($"Cannot start work in status {Status}. Must be in Scheduled status.");
        
        Status = WorkOrderStatus.InProgress;
        StartedAt = DateTime.UtcNow;
    }
    
    /// <summary>
    /// Field worker completes the work order.
    /// </summary>
    public void Complete(decimal? actualCost = null, string? completionNotes = null)
    {
        if (Status != WorkOrderStatus.InProgress)
            throw new InvalidOperationException($"Cannot complete work order in status {Status}. Must be in InProgress status.");
        
        Status = WorkOrderStatus.Completed;
        ActualCost = actualCost;
        CompletionNotes = completionNotes;
        CompletedAt = DateTime.UtcNow;
    }
    
    /// <summary>
    /// Cancels the work order.
    /// </summary>
    public void Cancel()
    {
        if (Status == WorkOrderStatus.Completed)
            throw new InvalidOperationException("Cannot cancel a completed work order.");
        
        Status = WorkOrderStatus.Cancelled;
    }
    
    /// <summary>
    /// Updates the priority of the work order.
    /// </summary>
    public void UpdatePriority(int newPriority)
    {
        if (newPriority < 1)
            throw new ArgumentException("Priority must be at least 1.", nameof(newPriority));
        
        Priority = newPriority;
    }

    /// <summary>
    /// Increments actual cost while work is active or after completion.
    /// </summary>
    public void AddActualCost(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be positive.", nameof(amount));

        ActualCost = (ActualCost ?? 0) + amount;
    }
}
