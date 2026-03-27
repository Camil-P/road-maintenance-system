using System.ComponentModel.DataAnnotations;

namespace RoadMaintenance.Api.Features.Analytics.Contracts;

public class AnalyticsPeriodQuery
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}

public class HotspotQuery : AnalyticsPeriodQuery
{
    [Range(1, 10000)]
    public double ClusterRadiusMeters { get; set; } = 500;

    [Range(1, 100)]
    public int MinimumIncidents { get; set; } = 3;
}

public class HotspotResponse
{
    public double CenterLatitude { get; set; }
    public double CenterLongitude { get; set; }
    public int IncidentCount { get; set; }
    public IEnumerable<Guid> IncidentIds { get; set; } = [];
}

public class ResponseTimeSummaryResponse
{
    public int IncidentCount { get; set; }
    public double AverageHours { get; set; }
}

public class BudgetOverviewResponse
{
    public decimal EmergencyCost { get; set; }
    public decimal RegularCost { get; set; }
    public decimal TotalCost { get; set; }
}
