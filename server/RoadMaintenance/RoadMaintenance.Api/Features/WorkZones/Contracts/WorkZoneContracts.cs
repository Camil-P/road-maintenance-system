using RoadMaintenance.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace RoadMaintenance.Api.Features.WorkZones.Contracts;

public class CreateWorkZoneRequest
{
    [Required] [MaxLength(300)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string GeometryJson { get; set; } = string.Empty;

    [Range(1, double.MaxValue)]
    public double LengthMeters { get; set; }

    [Required]
    public AffectedLane AffectedLane { get; set; }
}

public class UpdateWorkZoneProgressRequest
{
    [Required]
    public string NewGeometryJson { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public double NewRemainingLengthMeters { get; set; }

    [Required] [MinLength(5)] [MaxLength(2000)]
    public string Note { get; set; } = string.Empty;
}

public class WorkZoneResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string GeometryJson { get; set; } = string.Empty;
    public string OriginalGeometryJson { get; set; } = string.Empty;
    public double OriginalLengthMeters { get; set; }
    public double RemainingLengthMeters { get; set; }
    public double CompletedLengthMeters { get; set; }
    public double ProgressPercent { get; set; }
    public AffectedLane AffectedLane { get; set; }
    public string AffectedLaneName { get; set; } = string.Empty;
    public WorkZoneStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int HistoryCount { get; set; }
}

public class WorkZoneHistoryResponse
{
    public Guid Id { get; set; }
    public string GeometryJson { get; set; } = string.Empty;
    public double TotalLengthMeters { get; set; }
    public double CompletedMeters { get; set; }
    public string Note { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class WorkZoneDetailResponse : WorkZoneResponse
{
    public List<WorkZoneHistoryResponse> History { get; set; } = [];
}
