using RoadMaintenance.Domain.Enums;
using RoadMaintenance.Domain.Interfaces;

namespace RoadMaintenance.Domain.Entities;

/// <summary>
/// Represents physical infrastructure assets (bridges, traffic lights, signs, etc.)
/// that need to be maintained and tracked.
/// </summary>
public class InfrastructureAsset : IMustHaveTenant
{
    public Guid Id { get; private set; }
    
    /// <summary>
    /// Type of infrastructure asset
    /// </summary>
    public AssetType Type { get; private set; }
    
    /// <summary>
    /// Human-readable name or identifier for the asset
    /// </summary>
    public string Name { get; private set; } = string.Empty;
    
    /// <summary>
    /// GPS latitude of the asset location
    /// </summary>
    public double Latitude { get; private set; }
    
    /// <summary>
    /// GPS longitude of the asset location
    /// </summary>
    public double Longitude { get; private set; }
    
    /// <summary>
    /// Free-text description of the asset location
    /// </summary>
    public string LocationDescription { get; private set; } = string.Empty;
    
    /// <summary>
    /// Year when the asset was constructed/installed
    /// </summary>
    public int? ConstructionYear { get; private set; }
    
    /// <summary>
    /// Warranty expiration date from the contractor
    /// </summary>
    public DateTime? WarrantyExpiration { get; private set; }
    
    /// <summary>
    /// Name of the contractor who installed/built the asset
    /// </summary>
    public string? ContractorName { get; private set; }
    
    /// <summary>
    /// ID of the agency that this infrastructure asset belongs to.
    /// </summary>
    public Guid? AgencyId { get; set; }
    public Agency? Agency { get; set; }

    /// <summary>
    /// Optional reference to the road segment this asset belongs to
    /// </summary>
    public Guid? RoadSegmentId { get; private set; }
    public RoadSegment? RoadSegment { get; private set; }
    
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    
    // Private constructor for EF Core
    private InfrastructureAsset() { }
    
    public static InfrastructureAsset Create(
        AssetType type,
        string name,
        double latitude,
        double longitude,
        string locationDescription,
        int? constructionYear = null,
        DateTime? warrantyExpiration = null,
        string? contractorName = null,
        Guid? roadSegmentId = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Asset name is required.", nameof(name));
        
        ValidateCoordinates(latitude, longitude);
        
        return new InfrastructureAsset
        {
            Id = Guid.NewGuid(),
            Type = type,
            Name = name,
            Latitude = latitude,
            Longitude = longitude,
            LocationDescription = locationDescription ?? string.Empty,
            ConstructionYear = constructionYear,
            WarrantyExpiration = warrantyExpiration,
            ContractorName = contractorName,
            RoadSegmentId = roadSegmentId,
            CreatedAt = DateTime.UtcNow
        };
    }
    
    public void UpdateLocation(double latitude, double longitude, string locationDescription)
    {
        ValidateCoordinates(latitude, longitude);
        
        Latitude = latitude;
        Longitude = longitude;
        LocationDescription = locationDescription ?? string.Empty;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void AssignToRoadSegment(Guid? roadSegmentId)
    {
        RoadSegmentId = roadSegmentId;
        UpdatedAt = DateTime.UtcNow;
    }
    
    private static void ValidateCoordinates(double latitude, double longitude)
    {
        if (latitude is < -90 or > 90)
            throw new ArgumentOutOfRangeException(nameof(latitude), "Latitude must be between -90 and 90.");
        
        if (longitude is < -180 or > 180)
            throw new ArgumentOutOfRangeException(nameof(longitude), "Longitude must be between -180 and 180.");
    }
}
