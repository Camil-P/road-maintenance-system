using System.Text.Json.Serialization;

namespace RoadMaintenance.Domain.Enums;

/// <summary>
/// Classification of road segments by importance and traffic capacity.
/// Used for priority calculations in work orders.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum RoadCategory
{
    /// <summary>Major highway with high traffic volume</summary>
    Highway = 1,
    
    /// <summary>Main road connecting major areas</summary>
    MainRoad = 2,
    
    /// <summary>Local road with lower traffic</summary>
    LocalRoad = 3
}
