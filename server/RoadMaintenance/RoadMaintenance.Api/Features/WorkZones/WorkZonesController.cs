using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoadMaintenance.Api.Common;
using RoadMaintenance.Api.Features.WorkZones.Contracts;

namespace RoadMaintenance.Api.Features.WorkZones;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WorkZonesController : ControllerBase
{
    private readonly IWorkZonesHandler _handler;

    public WorkZonesController(IWorkZonesHandler handler) => _handler = handler;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateWorkZoneRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var (success, response, error) = await _handler.CreateAsync(request, userId);
        if (!success) return BadRequest(ApiResponse<object>.Fail(error!));
        return Created($"/api/workzones/{response!.Id}", ApiResponse<WorkZoneResponse>.Ok(response, "Work zone created."));
    }

    [HttpGet]
    public async Task<IActionResult> List()
    {
        var zones = await _handler.ListAsync();
        return Ok(ApiResponse<List<WorkZoneResponse>>.Ok(zones));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var zone = await _handler.GetByIdAsync(id);
        if (zone is null) return NotFound(ApiResponse<object>.Fail("Work zone not found."));
        return Ok(ApiResponse<WorkZoneDetailResponse>.Ok(zone));
    }

    [HttpPatch("{id:guid}/progress")]
    public async Task<IActionResult> UpdateProgress(Guid id, [FromBody] UpdateWorkZoneProgressRequest request)
    {
        var (success, response, error) = await _handler.UpdateProgressAsync(id, request);
        if (!success) return BadRequest(ApiResponse<object>.Fail(error!));
        return Ok(ApiResponse<WorkZoneResponse>.Ok(response!, "Progress updated."));
    }

    [HttpPatch("{id:guid}/pause")]
    public async Task<IActionResult> Pause(Guid id)
    {
        var (success, error) = await _handler.PauseAsync(id);
        if (!success) return BadRequest(ApiResponse.Fail(error!));
        return Ok(ApiResponse.Ok("Work zone paused."));
    }

    [HttpPatch("{id:guid}/resume")]
    public async Task<IActionResult> Resume(Guid id)
    {
        var (success, error) = await _handler.ResumeAsync(id);
        if (!success) return BadRequest(ApiResponse.Fail(error!));
        return Ok(ApiResponse.Ok("Work zone resumed."));
    }

    [HttpPatch("{id:guid}/complete")]
    public async Task<IActionResult> Complete(Guid id, [FromBody] CompleteRequest request)
    {
        var (success, error) = await _handler.CompleteAsync(id, request.Note);
        if (!success) return BadRequest(ApiResponse.Fail(error!));
        return Ok(ApiResponse.Ok("Work zone completed."));
    }
}

public class CompleteRequest
{
    public string Note { get; set; } = string.Empty;
}
