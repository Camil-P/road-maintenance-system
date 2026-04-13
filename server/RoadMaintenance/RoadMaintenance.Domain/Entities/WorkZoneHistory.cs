namespace RoadMaintenance.Domain.Entities;

/// <summary>
/// A snapshot of a WorkZone at a point in time.
/// Each time the zone is updated (shrunk, moved, completed), a history record is created.
/// </summary>
public class WorkZoneHistory
{
    public Guid Id { get; private set; }
    public Guid WorkZoneId { get; private set; }
    public WorkZone WorkZone { get; private set; } = null!;

    /// <summary>
    /// The geometry at the time of this snapshot.
    /// </summary>
    public string GeometryJson { get; private set; } = string.Empty;

    /// <summary>
    /// Total length of the zone at this snapshot.
    /// </summary>
    public double TotalLengthMeters { get; private set; }

    /// <summary>
    /// How many meters were completed in this update (delta).
    /// </summary>
    public double CompletedMeters { get; private set; }

    /// <summary>
    /// Free-text note describing what was done.
    /// </summary>
    public string Note { get; private set; } = string.Empty;

    public DateTime CreatedAt { get; private set; }

    private WorkZoneHistory() { }

    public static WorkZoneHistory Create(
        Guid workZoneId,
        string geometryJson,
        double totalLengthMeters,
        double completedMeters,
        string note)
    {
        return new WorkZoneHistory
        {
            Id = Guid.NewGuid(),
            WorkZoneId = workZoneId,
            GeometryJson = geometryJson,
            TotalLengthMeters = totalLengthMeters,
            CompletedMeters = completedMeters,
            Note = note,
            CreatedAt = DateTime.UtcNow
        };
    }
}
