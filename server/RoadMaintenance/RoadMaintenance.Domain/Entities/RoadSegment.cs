using RoadMaintenance.Domain.Enums;
using RoadMaintenance.Domain.Interfaces;

namespace RoadMaintenance.Domain.Entities;

/// <summary>
/// Represents a segment of road in the system.
/// Road segments are the primary organizational unit for maintenance tracking.
/// </summary>
public class RoadSegment : IMustHaveTenant
{
    public Guid Id { get; private set; }
    
    /// <summary>
    /// Human-readable name or identifier for the road segment (e.g., "Highway A1 - Section 23")
    /// </summary>
    public string Name { get; private set; } = string.Empty;
    
    /// <summary>
    /// Classification of the road (Highway, MainRoad, LocalRoad)
    /// </summary>
    public RoadCategory Category { get; private set; }
    
    /// <summary>
    /// Current operational status of the road segment
    /// </summary>
    public RoadStatus Status { get; private set; }
    
    /// <summary>
    /// Length of the road segment in kilometers
    /// </summary>
    public decimal LengthKm { get; private set; }
    
    /// <summary>
    /// Free-text description of the road segment, including location details
    /// </summary>
    public string Description { get; private set; } = string.Empty;
    
    /// <summary>
    /// Starting point latitude (optional for v1)
    /// </summary>
    public double? StartLatitude { get; private set; }
    
    /// <summary>
    /// Starting point longitude (optional for v1)
    /// </summary>
    public double? StartLongitude { get; private set; }
    
    /// <summary>
    /// Ending point latitude (optional for v1)
    /// </summary>
    public double? EndLatitude { get; private set; }
    
    /// <summary>
    /// Ending point longitude (optional for v1)
    /// </summary>
    public double? EndLongitude { get; private set; }
    
    /// <summary>
    /// ID of the agency that this road segment belongs to. 
    /// This is determined based on the road segment location and agency jurisdiction areas.
    /// </summary>
    public Guid? AgencyId { get; set; }
    public Agency? Agency { get; set; }
    
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    
    // Navigation properties
    public ICollection<InfrastructureAsset> Assets { get; private set; } = [];
    public ICollection<IncidentReport> Incidents { get; private set; } = [];
    public ICollection<WorkOrder> WorkOrders { get; private set; } = [];
    
    // Private constructor for EF Core
    private RoadSegment() { }
    
    public static RoadSegment Create(
        string name,
        RoadCategory category,
        decimal lengthKm,
        string description,
        double? startLatitude = null,
        double? startLongitude = null,
        double? endLatitude = null,
        double? endLongitude = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Road segment name is required.", nameof(name));
        
        if (lengthKm <= 0)
            throw new ArgumentException("Length must be positive.", nameof(lengthKm));
        
        return new RoadSegment
        {
            Id = Guid.NewGuid(),
            Name = name,
            Category = category,
            Status = RoadStatus.Open,
            LengthKm = lengthKm,
            Description = description ?? string.Empty,
            StartLatitude = startLatitude,
            StartLongitude = startLongitude,
            EndLatitude = endLatitude,
            EndLongitude = endLongitude,
            CreatedAt = DateTime.UtcNow
        };
    }
    
    public void UpdateStatus(RoadStatus newStatus)
    {
        Status = newStatus;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void Update(string name, RoadCategory category, decimal lengthKm, string description)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Road segment name is required.", nameof(name));
        
        if (lengthKm <= 0)
            throw new ArgumentException("Length must be positive.", nameof(lengthKm));
        
        Name = name;
        Category = category;
        LengthKm = lengthKm;
        Description = description ?? string.Empty;
        UpdatedAt = DateTime.UtcNow;
    }
}
