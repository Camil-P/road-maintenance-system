using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoadMaintenance.Api.Common;
using RoadMaintenance.Api.Features.Analytics.Contracts;
using RoadMaintenance.Infrastructure.Identity;

namespace RoadMaintenance.Api.Features.Analytics;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = $"{ApplicationRoles.Admin},{ApplicationRoles.Dispatcher},{ApplicationRoles.MaintenanceManager}")]
public class AnalyticsController(IAnalyticsHandler analyticsHandler) : ControllerBase
{
    private readonly IAnalyticsHandler _analyticsHandler = analyticsHandler;

    [HttpGet("hotspots")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<HotspotResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetHotspots([FromQuery] HotspotQuery query)
    {
        var result = await _analyticsHandler.GetHotspotsAsync(query);
        return Ok(ApiResponse<IEnumerable<HotspotResponse>>.Ok(result));
    }

    [HttpGet("response-time")]
    [ProducesResponseType(typeof(ApiResponse<ResponseTimeSummaryResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetResponseTime([FromQuery] AnalyticsPeriodQuery query)
    {
        var result = await _analyticsHandler.GetAverageResponseTimeAsync(query);
        return Ok(ApiResponse<ResponseTimeSummaryResponse>.Ok(result));
    }

    [HttpGet("budget-overview")]
    [ProducesResponseType(typeof(ApiResponse<BudgetOverviewResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBudgetOverview([FromQuery] AnalyticsPeriodQuery query)
    {
        var result = await _analyticsHandler.GetBudgetOverviewAsync(query);
        return Ok(ApiResponse<BudgetOverviewResponse>.Ok(result));
    }
}
