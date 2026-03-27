using RoadMaintenance.Api.Features.Incidents.Contracts.Validations;
using RoadMaintenance.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace RoadMaintenance.Api.Features.Incidents.Contracts;

/// <summary>
/// Request DTO for creating a new incident report.
/// </summary>
public class CreateIncidentRequest
{
    [Required]
    [ValidIncidentType]
    public IncidentType Type { get; set; }
    
    [Required]
    [MinLength(10, ErrorMessage = "Description must be at least 10 characters.")]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;
    
    /// <summary>
    /// Optional latitude coordinate of the incident location.
    /// </summary>
    [Range(-90, 90, ErrorMessage = "Latitude must be between -90 and 90.")]
    public double? Latitude { get; set; }
    
    /// <summary>
    /// Optional longitude coordinate of the incident location.
    /// </summary>
    [Range(-180, 180, ErrorMessage = "Longitude must be between -180 and 180.")]
    public double? Longitude { get; set; }
    
    /// <summary>
    /// Free-text description of the location.
    /// </summary>
    [MaxLength(1000)]
    public string? LocationDescription { get; set; }
    
    /// <summary>
    /// Optional ID of the road segment where the incident occurred.
    /// </summary>
    public Guid? RoadSegmentId { get; set; }
}

/// <summary>
/// Response DTO for an incident report.
/// </summary>
public class IncidentResponse
{
    public Guid Id { get; set; }
    public IncidentType Type { get; set; }
    public string TypeName { get; set; } = string.Empty;
    public IncidentStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string LocationDescription { get; set; } = string.Empty;
    public Guid? RoadSegmentId { get; set; }
    public string? RoadSegmentName { get; set; }
    public string ReportedByUserId { get; set; } = string.Empty;
    public DateTime ReportedAt { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public bool HasPotentialDuplicates { get; set; }
    public IEnumerable<Guid>? PotentialDuplicateIds { get; set; }
}

/// <summary>
/// Query parameters for filtering incidents.
/// </summary>
public class GetIncidentsQuery
{
    /// <summary>
    /// Filter by incident status.
    /// </summary>
    public IncidentStatus? Status { get; set; }
    
    /// <summary>
    /// Filter by incident type.
    /// </summary>
    public IncidentType? Type { get; set; }
    
    /// <summary>
    /// Filter by road segment.
    /// </summary>
    public Guid? RoadSegmentId { get; set; }
    
    /// <summary>
    /// Filter incidents reported on or after this date.
    /// </summary>
    public DateTime? FromDate { get; set; }
    
    /// <summary>
    /// Filter incidents reported on or before this date.
    /// </summary>
    public DateTime? ToDate { get; set; }
    
    /// <summary>
    /// Filter by reporter user ID (for drivers viewing their own reports).
    /// </summary>
    public string? ReportedByUserId { get; set; }
    
    /// <summary>
    /// Page number (1-based).
    /// </summary>
    [Range(1, int.MaxValue)]
    public int Page { get; set; } = 1;
    
    /// <summary>
    /// Number of items per page.
    /// </summary>
    [Range(1, 100)]
    public int PageSize { get; set; } = 20;
}

/// <summary>
/// Paginated response for incidents.
/// </summary>
public class PaginatedResponse<T>
{
    public IEnumerable<T> Items { get; set; } = [];
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasNextPage => Page < TotalPages;
    public bool HasPreviousPage => Page > 1;
}
