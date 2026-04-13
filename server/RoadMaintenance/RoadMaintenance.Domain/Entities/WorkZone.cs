using RoadMaintenance.Domain.Enums;

namespace RoadMaintenance.Domain.Entities;

/// <summary>
/// Represents a zone on a road where work is being done.
/// The geometry can be updated over time (shrunk as work completes).
/// Each update creates a WorkZoneHistory snapshot.
/// </summary>
public class WorkZone
{
    public Guid Id { get; private set; }

    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Current GeoJSON LineString geometry of the remaining work zone.
    /// </summary>
    public string GeometryJson { get; private set; } = string.Empty;

    /// <summary>
    /// Original geometry when first created (never changes).
    /// </summary>
    public string OriginalGeometryJson { get; private set; } = string.Empty;

    /// <summary>
    /// Original total length in meters (set at creation, never changes).
    /// </summary>
    public double OriginalLengthMeters { get; private set; }

    /// <summary>
    /// Current remaining length in meters.
    /// </summary>
    public double RemainingLengthMeters { get; private set; }

    public AffectedLane AffectedLane { get; private set; }

    public WorkZoneStatus Status { get; private set; }

    public string CreatedByUserId { get; private set; } = string.Empty;

    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    public ICollection<WorkZoneHistory> History { get; private set; } = [];

    private WorkZone() { }

    public static WorkZone Create(
        string name,
        string geometryJson,
        double lengthMeters,
        AffectedLane affectedLane,
        string createdByUserId)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required.", nameof(name));

        if (string.IsNullOrWhiteSpace(geometryJson))
            throw new ArgumentException("Geometry is required.", nameof(geometryJson));

        if (lengthMeters <= 0)
            throw new ArgumentException("Length must be positive.", nameof(lengthMeters));

        return new WorkZone
        {
            Id = Guid.NewGuid(),
            Name = name,
            GeometryJson = geometryJson,
            OriginalGeometryJson = geometryJson,
            OriginalLengthMeters = lengthMeters,
            RemainingLengthMeters = lengthMeters,
            AffectedLane = affectedLane,
            Status = WorkZoneStatus.Active,
            CreatedByUserId = createdByUserId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    /// <summary>
    /// Update the work zone with new (smaller) geometry after work is completed.
    /// Creates a history snapshot of the previous state.
    /// </summary>
    public WorkZoneHistory UpdateProgress(
        string newGeometryJson,
        double newRemainingLengthMeters,
        string note)
    {
        if (Status != WorkZoneStatus.Active)
            throw new InvalidOperationException("Cannot update a non-active work zone.");

        var completedMeters = RemainingLengthMeters - newRemainingLengthMeters;

        // Snapshot the current state before changing
        var history = WorkZoneHistory.Create(
            workZoneId: Id,
            geometryJson: GeometryJson,
            totalLengthMeters: RemainingLengthMeters,
            completedMeters: completedMeters > 0 ? completedMeters : 0,
            note: note);

        GeometryJson = newGeometryJson;
        RemainingLengthMeters = newRemainingLengthMeters;
        UpdatedAt = DateTime.UtcNow;

        if (newRemainingLengthMeters <= 0)
        {
            Status = WorkZoneStatus.Completed;
        }

        return history;
    }

    public void Pause()
    {
        if (Status != WorkZoneStatus.Active)
            throw new InvalidOperationException("Can only pause an active work zone.");
        Status = WorkZoneStatus.Paused;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Resume()
    {
        if (Status != WorkZoneStatus.Paused)
            throw new InvalidOperationException("Can only resume a paused work zone.");
        Status = WorkZoneStatus.Active;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Complete(string note)
    {
        if (Status == WorkZoneStatus.Completed)
            throw new InvalidOperationException("Already completed.");

        var history = WorkZoneHistory.Create(
            workZoneId: Id,
            geometryJson: GeometryJson,
            totalLengthMeters: RemainingLengthMeters,
            completedMeters: RemainingLengthMeters,
            note: note);

        History.Add(history);
        RemainingLengthMeters = 0;
        Status = WorkZoneStatus.Completed;
        UpdatedAt = DateTime.UtcNow;
    }
}
