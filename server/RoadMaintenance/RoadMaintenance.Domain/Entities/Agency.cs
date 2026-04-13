using NetTopologySuite.Geometries;
using RoadMaintenance.Domain.Enums;

namespace RoadMaintenance.Domain.Entities;

/// <summary>
/// Represents physical infrastructure assets (bridges, traffic lights, signs, etc.)
/// that need to be maintained and tracked.
/// </summary>
public class Agency
{
    public Guid Id { get; private set; }
    
    /// <summary>
    /// Type of infrastructure asset
    /// </summary>
    public AssetType Type { get; private set; }
    
    /// <summary>
    /// Human-readable name or identifier for the Agency
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Geospatial polygon representing the area of responsibility for this agency. This can be used to determine which incidents fall under this agency's jurisdiction.
    /// </summary>
    public Polygon? RegionBoundary { get; set; }

    /// <summary>
    /// Indicates whether the agency is currently active and responsible for maintenance
    /// </summary>
    public bool IsActive { get; private set; }

    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    // Private constructor for EF Core
    private Agency() { }

    public static Agency Create(string name, Polygon? regionBoundary)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Agency name cannot be empty.");

        return new Agency
        {
            Id = Guid.NewGuid(),
            Name = name,
            RegionBoundary = regionBoundary,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void UpdateDetails(string name, Polygon? regionBoundary)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Agency name cannot be empty.");

        Name = name;
        RegionBoundary = regionBoundary;
    }

    public void Deactivate() => IsActive = false;
    public void Activate() => IsActive = true;
}
