using Microsoft.EntityFrameworkCore;
using RoadMaintenance.Api.Features.Analytics.Contracts;
using RoadMaintenance.Domain.Enums;
using RoadMaintenance.Domain.Services;
using RoadMaintenance.Infrastructure.Persistence;

namespace RoadMaintenance.Api.Features.Analytics;

public interface IAnalyticsHandler
{
    Task<IEnumerable<HotspotResponse>> GetHotspotsAsync(HotspotQuery query);
    Task<ResponseTimeSummaryResponse> GetAverageResponseTimeAsync(AnalyticsPeriodQuery query);
    Task<BudgetOverviewResponse> GetBudgetOverviewAsync(AnalyticsPeriodQuery query);
}

public class AnalyticsHandler : IAnalyticsHandler
{
    private readonly AppDbContext _context;
    private readonly ILocationService _locationService;

    public AnalyticsHandler(AppDbContext context, ILocationService locationService)
    {
        _context = context;
        _locationService = locationService;
    }

    public async Task<IEnumerable<HotspotResponse>> GetHotspotsAsync(HotspotQuery query)
    {
        var fromDate = query.FromDate.HasValue ? DateTime.SpecifyKind(query.FromDate.Value, DateTimeKind.Utc) : (DateTime?)null;
        var toDate = query.ToDate.HasValue ? DateTime.SpecifyKind(query.ToDate.Value, DateTimeKind.Utc) : (DateTime?)null;

        var incidentsQuery = _context.IncidentReports
            .AsNoTracking()
            .Where(i => i.Latitude.HasValue && i.Longitude.HasValue && i.Status != IncidentStatus.Rejected);

        if (fromDate.HasValue)
        {
            incidentsQuery = incidentsQuery.Where(i => i.ReportedAt >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            incidentsQuery = incidentsQuery.Where(i => i.ReportedAt <= toDate.Value);
        }

        var incidents = await incidentsQuery.ToListAsync();

        var clusters = _locationService.GroupIncidentsIntoClusters(
            incidents,
            query.ClusterRadiusMeters,
            query.MinimumIncidents);

        return clusters.Select(c => new HotspotResponse
        {
            CenterLatitude = c.CenterLatitude,
            CenterLongitude = c.CenterLongitude,
            IncidentCount = c.IncidentCount,
            IncidentIds = c.IncidentIds
        });
    }

    public async Task<ResponseTimeSummaryResponse> GetAverageResponseTimeAsync(AnalyticsPeriodQuery query)
    {
        var fromDate = query.FromDate.HasValue ? DateTime.SpecifyKind(query.FromDate.Value, DateTimeKind.Utc) : (DateTime?)null;
        var toDate = query.ToDate.HasValue ? DateTime.SpecifyKind(query.ToDate.Value, DateTimeKind.Utc) : (DateTime?)null;

        var incidentsQuery = _context.IncidentReports
            .AsNoTracking()
            .Where(i => i.Status == IncidentStatus.Resolved && i.ResolvedAt.HasValue);

        if (fromDate.HasValue)
        {
            incidentsQuery = incidentsQuery.Where(i => i.ReportedAt >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            incidentsQuery = incidentsQuery.Where(i => i.ReportedAt <= toDate.Value);
        }

        var durations = await incidentsQuery
            .Select(i => new { i.ReportedAt, ResolvedAt = i.ResolvedAt!.Value })
            .ToListAsync();

        if (durations.Count == 0)
        {
            return new ResponseTimeSummaryResponse();
        }

        var averageSeconds = durations
            .Select(x => (x.ResolvedAt - x.ReportedAt).TotalSeconds)
            .Average();

        return new ResponseTimeSummaryResponse
        {
            IncidentCount = durations.Count,
            AverageHours = Math.Round(averageSeconds / 3600d, 2)
        };
    }

    public async Task<BudgetOverviewResponse> GetBudgetOverviewAsync(AnalyticsPeriodQuery query)
    {
        var fromDate = query.FromDate.HasValue ? DateTime.SpecifyKind(query.FromDate.Value, DateTimeKind.Utc) : (DateTime?)null;
        var toDate = query.ToDate.HasValue ? DateTime.SpecifyKind(query.ToDate.Value, DateTimeKind.Utc) : (DateTime?)null;

        var workOrdersQuery = _context.WorkOrders
            .AsNoTracking()
            .Where(w => w.ActualCost.HasValue);

        if (fromDate.HasValue)
        {
            workOrdersQuery = workOrdersQuery.Where(w => w.CreatedAt >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            workOrdersQuery = workOrdersQuery.Where(w => w.CreatedAt <= toDate.Value);
        }

        var emergencyCost = await workOrdersQuery
            .Where(w => w.IsEmergency)
            .SumAsync(w => w.ActualCost ?? 0);

        var regularCost = await workOrdersQuery
            .Where(w => !w.IsEmergency)
            .SumAsync(w => w.ActualCost ?? 0);

        return new BudgetOverviewResponse
        {
            EmergencyCost = emergencyCost,
            RegularCost = regularCost,
            TotalCost = emergencyCost + regularCost
        };
    }
}
