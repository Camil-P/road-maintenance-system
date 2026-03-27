namespace RoadMaintenance.Domain.Enums;

/// <summary>
/// Status flow for work orders.
/// Created → Scheduled → InProgress → Completed
/// </summary>
public enum WorkOrderStatus
{
    /// <summary>Work order has been created but not yet scheduled</summary>
    Created = 1,
    
    /// <summary>Work order is scheduled for execution</summary>
    Scheduled = 2,
    
    /// <summary>Work is currently in progress</summary>
    InProgress = 3,
    
    /// <summary>Work has been completed</summary>
    Completed = 4,
    
    /// <summary>Work order was cancelled</summary>
    Cancelled = 5
}
