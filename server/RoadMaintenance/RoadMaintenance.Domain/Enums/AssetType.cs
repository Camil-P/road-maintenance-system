namespace RoadMaintenance.Domain.Enums;

/// <summary>
/// Types of infrastructure assets that can be tracked.
/// </summary>
public enum AssetType
{
    /// <summary>Bridge structure</summary>
    Bridge = 1,
    
    /// <summary>Traffic light installation</summary>
    TrafficLight = 2,
    
    /// <summary>Traffic sign</summary>
    Sign = 3,
    
    /// <summary>Horizontal road marking (lines, symbols, etc.)</summary>
    HorizontalMarking = 4,
    
    /// <summary>Guardrail or safety barrier</summary>
    Guardrail = 5,
    
    /// <summary>Drainage system or culvert</summary>
    Drainage = 6,
    
    /// <summary>Street lighting</summary>
    StreetLight = 7,
    
    /// <summary>Other infrastructure asset</summary>
    Other = 99
}
