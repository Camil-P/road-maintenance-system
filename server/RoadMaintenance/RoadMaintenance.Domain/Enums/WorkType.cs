using System.Text.Json.Serialization;

namespace RoadMaintenance.Domain.Enums;

/// <summary>
/// Types of maintenance work that can be performed.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum WorkType
{
    /// <summary>Filling or repairing potholes</summary>
    PotholeRepair = 1,
    
    /// <summary>Repainting road markings and lines</summary>
    LineRepainting = 2,
    
    /// <summary>Removing snow from roads</summary>
    SnowRemoval = 3,
    
    /// <summary>Spreading salt for ice prevention</summary>
    Salting = 4,
    
    /// <summary>Repairing or replacing traffic lights</summary>
    TrafficLightRepair = 5,
    
    /// <summary>Replacing or repairing traffic signs</summary>
    SignReplacement = 6,
    
    /// <summary>Repairing guardrails or barriers</summary>
    GuardrailRepair = 7,
    
    /// <summary>Removing debris or obstacles</summary>
    DebrisRemoval = 8,
    
    /// <summary>Drainage or flooding remediation</summary>
    DrainageWork = 9,
    
    /// <summary>General road surface repair</summary>
    SurfaceRepair = 10,
    
    /// <summary>Other maintenance work</summary>
    Other = 99
}
