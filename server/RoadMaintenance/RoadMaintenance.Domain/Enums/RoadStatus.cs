using System.Text.Json.Serialization;

namespace RoadMaintenance.Domain.Enums;

/// <summary>
/// Current operational status of a road segment.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum RoadStatus
{
    /// <summary>Road is open for normal traffic</summary>
    Open = 1,
    
    /// <summary>Road works are in progress, may have reduced capacity</summary>
    UnderMaintenance = 2,
    
    /// <summary>Road is completely closed to traffic</summary>
    Closed = 3,
    
    /// <summary>Road is open but has dangerous conditions (use with caution)</summary>
    Dangerous = 4
}
