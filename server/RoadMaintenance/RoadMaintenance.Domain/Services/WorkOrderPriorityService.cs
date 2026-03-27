using RoadMaintenance.Domain.Entities;
using RoadMaintenance.Domain.Enums;

namespace RoadMaintenance.Domain.Services;

/// <summary>
/// Service for calculating work order priorities.
/// Priority is based on road category and incident type.
/// Lower numbers = higher priority.
/// </summary>
public interface IWorkOrderPriorityService
{
    /// <summary>
    /// Calculates the priority for a work order based on road category and incident type.
    /// </summary>
    /// <param name="roadCategory">The category of the road (highways get higher priority)</param>
    /// <param name="incidentType">The type of incident (safety-critical issues get higher priority)</param>
    /// <returns>Priority value (1 = highest, higher numbers = lower priority)</returns>
    int CalculatePriority(RoadCategory? roadCategory, IncidentType? incidentType);
    
    /// <summary>
    /// Calculates priority directly from an incident report and optional road segment.
    /// </summary>
    int CalculatePriority(IncidentReport incident, RoadSegment? roadSegment);
}

/// <summary>
/// Default implementation of work order priority calculation.
/// </summary>
public class WorkOrderPriorityService : IWorkOrderPriorityService
{
    // Priority ranges:
    // 1-3: Critical (highways + safety issues)
    // 4-6: High (main roads or highways + non-critical)
    // 7-9: Medium (local roads or main roads + minor issues)
    // 10+: Low (local roads + minor issues)
    
    public int CalculatePriority(RoadCategory? roadCategory, IncidentType? incidentType)
    {
        var roadPriority = GetRoadCategoryPriority(roadCategory);
        var incidentPriority = GetIncidentTypePriority(incidentType);
        
        // Combined priority: sum of both factors
        // This gives us a range of 2-10
        return roadPriority + incidentPriority;
    }
    
    public int CalculatePriority(IncidentReport incident, RoadSegment? roadSegment)
    {
        return CalculatePriority(roadSegment?.Category, incident.Type);
    }
    
    /// <summary>
    /// Gets priority modifier based on road category.
    /// Highways are most important (1), local roads least (3).
    /// </summary>
    private static int GetRoadCategoryPriority(RoadCategory? category)
    {
        return category switch
        {
            RoadCategory.Highway => 1,
            RoadCategory.MainRoad => 2,
            RoadCategory.LocalRoad => 3,
            null => 4, // Unknown road gets lowest road priority
            _ => 4
        };
    }
    
    /// <summary>
    /// Gets priority modifier based on incident type.
    /// Safety-critical issues get priority 1, minor issues get 5.
    /// </summary>
    private static int GetIncidentTypePriority(IncidentType? incidentType)
    {
        return incidentType switch
        {
            // Safety-critical issues - immediate danger
            IncidentType.TrafficLightIssue => 1,
            IncidentType.Ice => 1,
            IncidentType.Debris => 2,
            IncidentType.GuardrailDamage => 2,
            
            // Infrastructure issues - important but less urgent
            IncidentType.Pothole => 3,
            IncidentType.SignIssue => 3,
            IncidentType.Flooding => 3,
            
            // Maintenance issues - can be scheduled
            IncidentType.RoadMarkingIssue => 4,
            IncidentType.Other => 5,
            
            null => 5, // Unknown incident type gets lowest priority
            _ => 5
        };
    }
}
