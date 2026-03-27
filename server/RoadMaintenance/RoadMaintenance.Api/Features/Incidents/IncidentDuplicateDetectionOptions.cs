namespace RoadMaintenance.Api.Features.Incidents;

public class IncidentDuplicateDetectionOptions
{
    public const string SectionName = "IncidentDuplicateDetection";

    public double RadiusMeters { get; set; } = 100;
    public int TimeWindowHours { get; set; } = 24;
}
