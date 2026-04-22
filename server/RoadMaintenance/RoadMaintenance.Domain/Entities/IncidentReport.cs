using RoadMaintenance.Domain.Enums;
using RoadMaintenance.Domain.Interfaces;

namespace RoadMaintenance.Domain.Entities;

/// <summary>
/// Represents an incident report submitted by a driver.
/// Follows the status flow: Reported → Verified → WorkOrderIssued → Resolved
/// </summary>
public class IncidentReport : IMayHaveTenant
{
    public Guid Id { get; private set; }
    
    /// <summary>
    /// Type of incident being reported
    /// </summary>
    public IncidentType Type { get; private set; }
    
    /// <summary>
    /// Current status in the incident workflow
    /// </summary>
    public IncidentStatus Status { get; private set; }
    
    /// <summary>
    /// Detailed description of the incident
    /// </summary>
    public string Description { get; private set; } = string.Empty;
    
    /// <summary>
    /// GPS latitude of the incident location (optional)
    /// </summary>
    public double? Latitude { get; private set; }
    
    /// <summary>
    /// GPS longitude of the incident location (optional)
    /// </summary>
    public double? Longitude { get; private set; }
    
    /// <summary>
    /// Free-text description of the incident location
    /// </summary>
    public string LocationDescription { get; private set; } = string.Empty;
    
    /// <summary>
    /// Optional reference to the road segment where the incident occurred
    /// </summary>
    public Guid? RoadSegmentId { get; private set; }
    public RoadSegment? RoadSegment { get; private set; }
    
    /// <summary>
    /// ID of the user (Driver) who reported the incident
    /// </summary>
    public string ReportedByUserId { get; private set; } = string.Empty;
    
    /// <summary>
    /// ID of the user (Dispatcher) who verified the incident
    /// </summary>
    public string? VerifiedByUserId { get; private set; }
    
    /// <summary>
    /// ID of the agency responsible for handling this incident. 
    /// This is determined based on the incident location and agency jurisdiction areas.
    /// </summary>
    public Guid? AgencyId { get; set; }
    public Agency? Agency { get; set; }
    
    /// <summary>
    /// Reference to the work order created for this incident (if any)
    /// </summary>
    public Guid? WorkOrderId { get; private set; }
    public WorkOrder? WorkOrder { get; private set; }
    
    /// <summary>
    /// Reference to a related/duplicate incident (if this was marked as duplicate)
    /// </summary>
    public Guid? RelatedIncidentId { get; private set; }
    public IncidentReport? RelatedIncident { get; private set; }
    
    public DateTime ReportedAt { get; private set; }
    public DateTime? VerifiedAt { get; private set; }
    public DateTime? ResolvedAt { get; private set; }
    
    // Navigation property for duplicates pointing to this incident
    public ICollection<IncidentReport> RelatedIncidents { get; private set; } = [];
    
    // Private constructor for EF Core
    private IncidentReport() { }
    
    public static IncidentReport Create(
        IncidentType type,
        string description,
        string reportedByUserId,
        double? latitude = null,
        double? longitude = null,
        string? locationDescription = null,
        Guid? roadSegmentId = null)
    {
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("Incident description is required.", nameof(description));
        
        if (string.IsNullOrWhiteSpace(reportedByUserId))
            throw new ArgumentException("Reporter user ID is required.", nameof(reportedByUserId));
        
        if (latitude.HasValue || longitude.HasValue)
            ValidateCoordinates(latitude, longitude);
        
        return new IncidentReport
        {
            Id = Guid.NewGuid(),
            Type = type,
            Status = IncidentStatus.Reported,
            Description = description,
            Latitude = latitude,
            Longitude = longitude,
            LocationDescription = locationDescription ?? string.Empty,
            RoadSegmentId = roadSegmentId,
            ReportedByUserId = reportedByUserId,
            ReportedAt = DateTime.UtcNow
        };
    }
    
    /// <summary>
    /// Dispatcher verifies the incident as valid.
    /// </summary>
    public void Verify(string verifiedByUserId)
    {
        if (Status != IncidentStatus.Reported)
            throw new InvalidOperationException($"Cannot verify incident in status {Status}. Must be in Reported status.");
        
        if (string.IsNullOrWhiteSpace(verifiedByUserId))
            throw new ArgumentException("Verifier user ID is required.", nameof(verifiedByUserId));
        
        Status = IncidentStatus.Verified;
        VerifiedByUserId = verifiedByUserId;
        VerifiedAt = DateTime.UtcNow;
    }
    
    /// <summary>
    /// Links a work order to this incident and updates status.
    /// </summary>
    public void AssignWorkOrder(Guid workOrderId)
    {
        if (Status != IncidentStatus.Verified)
            throw new InvalidOperationException($"Cannot assign work order in status {Status}. Must be in Verified status.");
        
        WorkOrderId = workOrderId;
        Status = IncidentStatus.WorkOrderIssued;
    }
    
    /// <summary>
    /// Marks the incident as resolved.
    /// </summary>
    public void Resolve()
    {
        if (Status != IncidentStatus.WorkOrderIssued)
            throw new InvalidOperationException($"Cannot resolve incident in status {Status}. Must be in WorkOrderIssued status.");
        
        Status = IncidentStatus.Resolved;
        ResolvedAt = DateTime.UtcNow;
    }
    
    /// <summary>
    /// Marks this incident as a duplicate of another incident.
    /// </summary>
    public void MarkAsDuplicate(Guid relatedIncidentId, string verifiedByUserId)
    {
        if (Status != IncidentStatus.Reported)
            throw new InvalidOperationException($"Cannot mark as duplicate in status {Status}. Must be in Reported status.");
        
        RelatedIncidentId = relatedIncidentId;
        Status = IncidentStatus.Rejected;
        VerifiedByUserId = verifiedByUserId;
        VerifiedAt = DateTime.UtcNow;
    }
    
    /// <summary>
    /// Rejects the incident as invalid.
    /// </summary>
    public void Reject(string verifiedByUserId)
    {
        if (Status != IncidentStatus.Reported)
            throw new InvalidOperationException($"Cannot reject incident in status {Status}. Must be in Reported status.");
        
        Status = IncidentStatus.Rejected;
        VerifiedByUserId = verifiedByUserId;
        VerifiedAt = DateTime.UtcNow;
    }
    
    /// <summary>
    /// Checks if this incident has GPS coordinates.
    /// </summary>
    public bool HasCoordinates => Latitude.HasValue && Longitude.HasValue;
    
    private static void ValidateCoordinates(double? latitude, double? longitude)
    {
        if (latitude.HasValue && latitude.Value is < -90 or > 90)
            throw new ArgumentOutOfRangeException(nameof(latitude), "Latitude must be between -90 and 90.");
        
        if (longitude.HasValue && longitude.Value is < -180 or > 180)
            throw new ArgumentOutOfRangeException(nameof(longitude), "Longitude must be between -180 and 180.");
    }
}
