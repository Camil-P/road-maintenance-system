using RoadMaintenance.Domain.Entities;
using RoadMaintenance.Domain.Services;

namespace RoadMaintenance.Infrastructure.Services;

/// <summary>
/// Simple implementation of ILocationService using the Haversine formula.
/// This is a "black box" that can be replaced with a GIS-aware implementation later.
/// </summary>
public class SimpleLocationService : ILocationService
{
    private const double EarthRadiusMeters = 6_371_000; // Mean Earth radius in meters
    
    public bool AreLocationsClose(Location location1, Location location2, double radiusMeters)
    {
        var distance = CalculateDistanceMeters(location1, location2);
        return distance <= radiusMeters;
    }
    
    public double CalculateDistanceMeters(Location location1, Location location2)
    {
        // Haversine formula for calculating distance between two GPS coordinates
        var lat1Rad = DegreesToRadians(location1.Latitude);
        var lat2Rad = DegreesToRadians(location2.Latitude);
        var deltaLat = DegreesToRadians(location2.Latitude - location1.Latitude);
        var deltaLon = DegreesToRadians(location2.Longitude - location1.Longitude);
        
        var a = Math.Sin(deltaLat / 2) * Math.Sin(deltaLat / 2) +
                Math.Cos(lat1Rad) * Math.Cos(lat2Rad) *
                Math.Sin(deltaLon / 2) * Math.Sin(deltaLon / 2);
        
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        
        return EarthRadiusMeters * c;
    }
    
    public IReadOnlyList<Guid> FindPotentialDuplicates(
        IncidentReport newIncident,
        IEnumerable<IncidentReport> existingIncidents,
        double radiusMeters = 100,
        int timeWindowHours = 24)
    {
        // If the new incident doesn't have coordinates, we can't do location-based duplicate detection
        if (!newIncident.HasCoordinates)
            return [];
        
        var newLocation = new Location(newIncident.Latitude!.Value, newIncident.Longitude!.Value);
        var cutoffTime = DateTime.UtcNow.AddHours(-timeWindowHours);
        
        var duplicates = existingIncidents
            .Where(existing =>
                // Same incident type
                existing.Type == newIncident.Type &&
                // Has coordinates
                existing.HasCoordinates &&
                // Within time window
                existing.ReportedAt >= cutoffTime &&
                // Not resolved or rejected
                existing.Status != Domain.Enums.IncidentStatus.Resolved &&
                existing.Status != Domain.Enums.IncidentStatus.Rejected &&
                // Within radius
                AreLocationsClose(
                    newLocation,
                    new Location(existing.Latitude!.Value, existing.Longitude!.Value),
                    radiusMeters))
            .Select(i => i.Id)
            .ToList();
        
        return duplicates;
    }
    
    public IReadOnlyList<IncidentCluster> GroupIncidentsIntoClusters(
        IEnumerable<IncidentReport> incidents,
        double clusterRadiusMeters = 500,
        int minimumIncidents = 3)
    {
        // Filter to only incidents with coordinates
        var geoIncidents = incidents
            .Where(i => i.HasCoordinates)
            .ToList();
        
        if (geoIncidents.Count == 0)
            return [];
        
        var clusters = new List<IncidentCluster>();
        var assigned = new HashSet<Guid>();
        
        // Simple greedy clustering algorithm
        foreach (var incident in geoIncidents)
        {
            if (assigned.Contains(incident.Id))
                continue;
            
            var clusterCenter = new Location(incident.Latitude!.Value, incident.Longitude!.Value);
            
            // Find all incidents within radius of this one
            var nearbyIncidents = geoIncidents
                .Where(other => 
                    !assigned.Contains(other.Id) &&
                    AreLocationsClose(
                        clusterCenter,
                        new Location(other.Latitude!.Value, other.Longitude!.Value),
                        clusterRadiusMeters))
                .ToList();
            
            if (nearbyIncidents.Count >= minimumIncidents)
            {
                // Calculate cluster center as average of all coordinates
                var avgLat = nearbyIncidents.Average(i => i.Latitude!.Value);
                var avgLon = nearbyIncidents.Average(i => i.Longitude!.Value);
                var incidentIds = nearbyIncidents.Select(i => i.Id).ToList();
                
                foreach (var id in incidentIds)
                    assigned.Add(id);
                
                clusters.Add(new IncidentCluster(avgLat, avgLon, incidentIds.Count, incidentIds));
            }
        }
        
        // Sort by incident count descending (hottest spots first)
        return clusters.OrderByDescending(c => c.IncidentCount).ToList();
    }
    
    private static double DegreesToRadians(double degrees) => degrees * Math.PI / 180.0;
}
