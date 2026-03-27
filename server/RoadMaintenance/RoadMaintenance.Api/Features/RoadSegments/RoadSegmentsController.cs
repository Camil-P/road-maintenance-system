using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoadMaintenance.Api.Common;
using RoadMaintenance.Api.Features.Incidents.Contracts;
using RoadMaintenance.Api.Features.RoadSegments.Contracts;
using RoadMaintenance.Infrastructure.Identity;

namespace RoadMaintenance.Api.Features.RoadSegments;

[ApiController]
[Route("api/[controller]")]
public class RoadSegmentsController(
    IGetRoadSegmentsHandler getRoadSegmentsHandler,
    IGetRoadSegmentByIdHandler getByIdHandler,
    ICreateRoadSegmentHandler createHandler,
    IUpdateRoadSegmentHandler updateHandler,
    IUpdateRoadSegmentStatusHandler updateStatusHandler) : ControllerBase
{
    private readonly IGetRoadSegmentsHandler _getRoadSegmentsHandler = getRoadSegmentsHandler;
    private readonly IGetRoadSegmentByIdHandler _getByIdHandler = getByIdHandler;
    private readonly ICreateRoadSegmentHandler _createHandler = createHandler;
    private readonly IUpdateRoadSegmentHandler _updateHandler = updateHandler;
    private readonly IUpdateRoadSegmentStatusHandler _updateStatusHandler = updateStatusHandler;

    /// <summary>
    /// Gets a paginated list of road segments.
    /// </summary>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResponse<RoadSegmentResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRoadSegments([FromQuery] GetRoadSegmentsQuery query)
    {
        var result = await _getRoadSegmentsHandler.HandleAsync(query);
        return Ok(ApiResponse<PaginatedResponse<RoadSegmentResponse>>.Ok(result));
    }

    /// <summary>
    /// Gets a specific road segment by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<RoadSegmentResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRoadSegmentById(Guid id)
    {
        var segment = await _getByIdHandler.HandleAsync(id);

        if (segment is null)
        {
            return NotFound(ApiResponse.Fail("Road segment not found."));
        }

        return Ok(ApiResponse<RoadSegmentResponse>.Ok(segment));
    }

    /// <summary>
    /// Creates a new road segment. Accessible by Admins and Maintenance Managers.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = $"{ApplicationRoles.Admin},{ApplicationRoles.MaintenanceManager}")]
    [ProducesResponseType(typeof(ApiResponse<RoadSegmentResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateRoadSegment([FromBody] CreateRoadSegmentRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse.Fail("Validation failed.", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));

        var (success, response, error) = await _createHandler.HandleAsync(request);

        if (!success)
            return BadRequest(ApiResponse.Fail(error!));

        return CreatedAtAction(
            nameof(GetRoadSegmentById),
            new { id = response!.Id },
            ApiResponse<RoadSegmentResponse>.Ok(response, "Road segment created successfully."));
    }

    /// <summary>
    /// Updates an existing road segment's details.
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = $"{ApplicationRoles.Admin},{ApplicationRoles.MaintenanceManager}")]
    [ProducesResponseType(typeof(ApiResponse<RoadSegmentResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateRoadSegment(Guid id, [FromBody] UpdateRoadSegmentRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse.Fail("Validation failed.", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));

        var (success, response, error) = await _updateHandler.HandleAsync(id, request);

        if (!success)
        {
            if (error == "Road segment not found.")
                return NotFound(ApiResponse.Fail(error));

            return BadRequest(ApiResponse.Fail(error!));
        }

        return Ok(ApiResponse<RoadSegmentResponse>.Ok(response!, "Road segment updated successfully."));
    }

    /// <summary>
    /// Updates the operational status of a road segment.
    /// </summary>
    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = $"{ApplicationRoles.Admin},{ApplicationRoles.Dispatcher},{ApplicationRoles.MaintenanceManager}")]
    [ProducesResponseType(typeof(ApiResponse<RoadSegmentResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateRoadSegmentStatus(Guid id, [FromBody] UpdateRoadSegmentStatusRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse.Fail("Validation failed.", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));

        var (success, response, error) = await _updateStatusHandler.HandleAsync(id, request);

        if (!success)
        {
            if (error == "Road segment not found.")
                return NotFound(ApiResponse.Fail(error));

            return BadRequest(ApiResponse.Fail(error!));
        }

        return Ok(ApiResponse<RoadSegmentResponse>.Ok(response!, "Road segment status updated successfully."));
    }
}