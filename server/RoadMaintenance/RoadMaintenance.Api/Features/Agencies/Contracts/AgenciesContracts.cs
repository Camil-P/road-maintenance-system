using System.ComponentModel.DataAnnotations;

namespace RoadMaintenance.Api.Features.Agencies.Contracts;

public class CreateAgencyRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    // Za klijenta je najlakše da pošalje GeoJSON format kao string, 
    // a backend će to pretvoriti u NTS Polygon
    public string? RegionGeoJson { get; set; } 
}

public class UpdateAgencyRequest : CreateAgencyRequest;

public class AgencyResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? RegionGeoJson { get; set; }
}