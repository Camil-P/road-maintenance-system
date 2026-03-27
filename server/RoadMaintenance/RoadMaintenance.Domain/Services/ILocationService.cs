using RoadMaintenance.Domain.Entities;

namespace RoadMaintenance.Domain.Services;

/// <summary>
/// Represents a geographic location with coordinates and optional description.
/// Used as a DTO for location service operations.
/// </summary>
public record Location(double Latitude, double Longitude, string? Description = null);

/// <summary>
/// Represents a cluster of incidents for hotspot analysis.
/// </summary>
public record IncidentCluster(
    double CenterLatitude,
    double CenterLongitude,
    int IncidentCount,
    IReadOnlyList<Guid> IncidentIds);

/// <summary>
/// Abstraction for location-based operations.
/// In v1 this is implemented with simple math calculations.
/// Later can be replaced with a GIS/map-aware implementation.
/// </summary>
public interface ILocationService
{
    /// <summary>
    /// Checks if two locations are within a specified radius of each other.
    /// Used for duplicate incident detection.
    /// </summary>
    /// <param name="location1">First location</param>
    /// <param name="location2">Second location</param>
    /// <param name="radiusMeters">Maximum distance in meters to be considered "close"</param>
    /// <returns>True if the locations are within the specified radius</returns>
    bool AreLocationsClose(Location location1, Location location2, double radiusMeters);
    
    /// <summary>
    /// Calculates the distance between two locations in meters.
    /// </summary>
    /// <param name="location1">First location</param>
    /// <param name="location2">Second location</param>
    /// <returns>Distance in meters</returns>
    double CalculateDistanceMeters(Location location1, Location location2);
    
    /// <summary>
    /// Finds potential duplicate incidents based on location proximity and incident type.
    /// </summary>
    /// <param name="newIncident">The new incident to check</param>
    /// <param name="existingIncidents">List of existing incidents to check against</param>
    /// <param name="radiusMeters">Maximum distance to consider as potential duplicate</param>
    /// <param name="timeWindowHours">Only check incidents reported within this time window</param>
    /// <returns>List of potential duplicate incident IDs</returns>
    IReadOnlyList<Guid> FindPotentialDuplicates(
        IncidentReport newIncident,
        IEnumerable<IncidentReport> existingIncidents,
        double radiusMeters = 100,
        int timeWindowHours = 24);
    
    /// <summary>
    /// Groups incidents into geographic clusters for hotspot analysis.
    /// </summary>
    /// <param name="incidents">Incidents to cluster</param>
    /// <param name="clusterRadiusMeters">Maximum radius for a cluster</param>
    /// <param name="minimumIncidents">Minimum incidents to form a cluster</param>
    /// <returns>List of incident clusters ordered by incident count (descending)</returns>
    IReadOnlyList<IncidentCluster> GroupIncidentsIntoClusters(
        IEnumerable<IncidentReport> incidents,
        double clusterRadiusMeters = 500,
        int minimumIncidents = 3);
}
