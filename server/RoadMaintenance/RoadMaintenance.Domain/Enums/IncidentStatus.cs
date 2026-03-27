namespace RoadMaintenance.Domain.Enums;

/// <summary>
/// Status flow for incident reports.
/// Reported → Verified → WorkOrderIssued → Resolved
/// </summary>
public enum IncidentStatus
{
    /// <summary>Initial status when a driver reports an incident</summary>
    Reported = 1,
    
    /// <summary>Dispatcher has verified the incident is valid</summary>
    Verified = 2,
    
    /// <summary>A work order has been created to address this incident</summary>
    WorkOrderIssued = 3,
    
    /// <summary>The incident has been resolved</summary>
    Resolved = 4,
    
    /// <summary>Incident was rejected as duplicate or invalid</summary>
    Rejected = 5
}
