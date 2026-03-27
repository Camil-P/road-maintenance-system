using RoadMaintenance.Domain.Entities;
using RoadMaintenance.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace RoadMaintenance.Api.Features.RoadSegments.Contracts;

/// <summary>
/// Response DTO for a road segment.
/// Maps to the frontend RoadSegment interface.
/// </summary>
public class RoadSegmentResponse
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    // In C# it's an enum, but your frontend expects a string.
    // Assuming your JSON serializer is configured to serialize enums as strings,
    // otherwise you can explicitly use string properties.
    public RoadCategory Category { get; set; }
    public string CategoryName { get; set; } = string.Empty;

    public RoadStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;

    /// <summary>
    /// Maps to LengthKm in the domain model, but named Length to match the frontend 'length' property.
    /// </summary>
    public decimal Length { get; set; }

    // Additional domain fields that the frontend might need later:
    public string Description { get; set; } = string.Empty;
    public double? StartLatitude { get; set; }
    public double? StartLongitude { get; set; }
    public double? EndLatitude { get; set; }
    public double? EndLongitude { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Request DTO for querying the get road segments.
/// </summary>
public class GetRoadSegmentsQuery
{
    public RoadStatus? Status { get; set; }
    public RoadCategory? Category { get; set; }

    [Range(1, int.MaxValue)]
    public int Page { get; set; } = 1;

    [Range(1, 100)]
    public int PageSize { get; set; } = 20;
}

/// <summary>
/// Request DTO for creating a new road segment.
/// </summary>
public class CreateRoadSegmentRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public RoadCategory Category { get; set; }

    [Required]
    [Range(0.01, 10000, ErrorMessage = "Length must be a positive number.")]
    public decimal LengthKm { get; set; }

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    // Optional coordinate fields
    [Range(-90, 90)]
    public double? StartLatitude { get; set; }

    [Range(-180, 180)]
    public double? StartLongitude { get; set; }

    [Range(-90, 90)]
    public double? EndLatitude { get; set; }

    [Range(-180, 180)]
    public double? EndLongitude { get; set; }
}

/// <summary>
/// Request DTO for updating an existing road segment.
/// </summary>
public class UpdateRoadSegmentRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public RoadCategory Category { get; set; }

    [Required]
    [Range(0.01, 10000, ErrorMessage = "Length must be a positive number.")]
    public decimal LengthKm { get; set; }

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;
}

/// <summary>
/// Request DTO for updating the status of a road segment.
/// </summary>
public class UpdateRoadSegmentStatusRequest
{
    [Required]
    public RoadStatus Status { get; set; }
}

public static class RoadSegmentMapper
{
    public static RoadSegmentResponse MapToResponse(RoadSegment segment)
    {
        return new RoadSegmentResponse
        {
            Id = segment.Id,
            Name = segment.Name,
            Category = segment.Category,
            CategoryName = segment.Category.ToString(),
            Status = segment.Status,
            StatusName = segment.Status.ToString(),
            Length = segment.LengthKm, // Mapping LengthKm to Length for the frontend
            Description = segment.Description,
            StartLatitude = segment.StartLatitude,
            StartLongitude = segment.StartLongitude,
            EndLatitude = segment.EndLatitude,
            EndLongitude = segment.EndLongitude,
            CreatedAt = segment.CreatedAt
        };
    }
}