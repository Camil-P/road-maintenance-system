using System.Text.Json.Serialization;

namespace RoadMaintenance.Domain.Enums;

/// <summary>
/// Types of incidents that can be reported by drivers.
/// Used for categorization and priority calculations.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum IncidentType
{
    /// <summary>Pothole or road surface damage</summary>
    Pothole = 1,
    
    /// <summary>Ice or snow on the road</summary>
    Ice = 2,
    
    /// <summary>Traffic light malfunction or damage</summary>
    TrafficLightIssue = 3,
    
    /// <summary>Fallen, damaged, or missing traffic sign</summary>
    SignIssue = 4,
    
    /// <summary>Faded or damaged road markings</summary>
    RoadMarkingIssue = 5,
    
    /// <summary>Debris or obstacles on the road</summary>
    Debris = 6,
    
    /// <summary>Flooding or water accumulation</summary>
    Flooding = 7,
    
    /// <summary>Guardrail or barrier damage</summary>
    GuardrailDamage = 8,
    
    /// <summary>Other issues not covered above</summary>
    Other = 99
}
