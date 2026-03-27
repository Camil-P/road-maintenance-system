using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoadMaintenance.Api.Common;
using RoadMaintenance.Api.Features.Incidents.Contracts;
using RoadMaintenance.Infrastructure.Identity;

namespace RoadMaintenance.Api.Features.Incidents;

[ApiController]
[Route("api/[controller]")]
public class IncidentsController(
    ICreateIncidentHandler createHandler,
    IGetIncidentsHandler getIncidentsHandler,
    IGetIncidentByIdHandler getByIdHandler,
    IVerifyIncidentHandler verifyIncidentHandler,
    IResolveIncidentHandler resolveIncidentHandler,
    IMarkIncidentAsDuplicateHandler markIncidentAsDuplicateHandler) : ControllerBase
{
    private readonly ICreateIncidentHandler _createHandler = createHandler;
    private readonly IGetIncidentsHandler _getIncidentsHandler = getIncidentsHandler;
    private readonly IGetIncidentByIdHandler _getByIdHandler = getByIdHandler;
    private readonly IVerifyIncidentHandler _verifyIncidentHandler = verifyIncidentHandler;
    private readonly IResolveIncidentHandler _resolveIncidentHandler = resolveIncidentHandler;
    private readonly IMarkIncidentAsDuplicateHandler _markIncidentAsDuplicateHandler = markIncidentAsDuplicateHandler;

    /// <summary>
    /// Creates a new incident report. Requires Driver role.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = $"{ApplicationRoles.Admin},{ApplicationRoles.Driver}")]
    [ProducesResponseType(typeof(ApiResponse<IncidentResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateIncident([FromBody] CreateIncidentRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage);
            return BadRequest(ApiResponse.Fail("Validation failed.", errors));
        }
        
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(ApiResponse.Fail("User not authenticated."));
        }
        
        var (success, response, error, potentialDuplicates) = await _createHandler.HandleAsync(request, userId);
        
        if (!success)
        {
            return BadRequest(ApiResponse.Fail(error!));
        }
        
        // Return 201 Created with the response
        // Include a warning if potential duplicates were detected
        var message = potentialDuplicates is { Count: > 0 }
            ? $"Incident created. Note: {potentialDuplicates.Count} potential duplicate(s) detected nearby."
            : "Incident created successfully.";
        
        return CreatedAtAction(
            nameof(GetIncidentById),
            new { id = response!.Id },
            ApiResponse<IncidentResponse>.Ok(response, message));
    }
    
    /// <summary>
    /// Gets a paginated list of incidents with optional filters.
    /// Accessible by Dispatchers, Maintenance Managers, and Drivers (for their own reports).
    /// </summary>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResponse<IncidentResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetIncidents([FromQuery] GetIncidentsQuery query)
    {
        // If user is a Driver, restrict to their own reports only
        var isDriver = User.IsInRole(ApplicationRoles.Driver) &&
                       !User.IsInRole(ApplicationRoles.Dispatcher) &&
                       !User.IsInRole(ApplicationRoles.MaintenanceManager);
        
        if (isDriver)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            query.ReportedByUserId = userId;
        }
        
        var result = await _getIncidentsHandler.HandleAsync(query);
        
        return Ok(ApiResponse<PaginatedResponse<IncidentResponse>>.Ok(result));
    }
    
    /// <summary>
    /// Gets a specific incident by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<IncidentResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetIncidentById(Guid id)
    {
        var incident = await _getByIdHandler.HandleAsync(id);
        
        if (incident is null)
        {
            return NotFound(ApiResponse.Fail("Incident not found."));
        }
        
        // If user is a Driver, they can only see their own reports
        var isDriver = User.IsInRole(ApplicationRoles.Driver) &&
                       !User.IsInRole(ApplicationRoles.Dispatcher) &&
                       !User.IsInRole(ApplicationRoles.MaintenanceManager);
        
        if (isDriver)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (incident.ReportedByUserId != userId)
            {
                return NotFound(ApiResponse.Fail("Incident not found."));
            }
        }
        
        return Ok(ApiResponse<IncidentResponse>.Ok(incident));
    }
    
    /// <summary>
    /// Gets my incidents (for drivers). Shorthand for GetIncidents with user filter.
    /// </summary>
    [HttpGet("my")]
    [Authorize(Roles = $"{ApplicationRoles.Admin},{ApplicationRoles.Driver}")]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResponse<IncidentResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyIncidents([FromQuery] GetIncidentsQuery query)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        query.ReportedByUserId = userId;
        
        var result = await _getIncidentsHandler.HandleAsync(query);
        
        return Ok(ApiResponse<PaginatedResponse<IncidentResponse>>.Ok(result));
    }

    /// <summary>
    /// Verifies a reported incident.
    /// </summary>
    [HttpPatch("{id:guid}/verify")]
    [Authorize(Roles = $"{ApplicationRoles.Admin},{ApplicationRoles.Dispatcher},{ApplicationRoles.MaintenanceManager}")]
    [ProducesResponseType(typeof(ApiResponse<IncidentResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> VerifyIncident(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(ApiResponse.Fail("User not authenticated."));
        }

        var (success, response, error) = await _verifyIncidentHandler.HandleAsync(id, userId);
        if (!success)
        {
            if (error == "Incident not found.")
            {
                return NotFound(ApiResponse.Fail(error));
            }

            return BadRequest(ApiResponse.Fail(error!));
        }

        return Ok(ApiResponse<IncidentResponse>.Ok(response!, "Incident verified successfully."));
    }

    /// <summary>
    /// Marks an incident as resolved.
    /// </summary>
    [HttpPatch("{id:guid}/resolve")]
    [Authorize(Roles = $"{ApplicationRoles.Admin},{ApplicationRoles.Dispatcher},{ApplicationRoles.MaintenanceManager}")]
    [ProducesResponseType(typeof(ApiResponse<IncidentResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ResolveIncident(Guid id)
    {
        var (success, response, error) = await _resolveIncidentHandler.HandleAsync(id);
        if (!success)
        {
            if (error == "Incident not found.")
            {
                return NotFound(ApiResponse.Fail(error));
            }

            return BadRequest(ApiResponse.Fail(error!));
        }

        return Ok(ApiResponse<IncidentResponse>.Ok(response!, "Incident resolved successfully."));
    }

    /// <summary>
    /// Marks an incident as duplicate of another incident.
    /// </summary>
    [HttpPatch("{id:guid}/mark-duplicate/{relatedIncidentId:guid}")]
    [Authorize(Roles = $"{ApplicationRoles.Admin},{ApplicationRoles.Dispatcher},{ApplicationRoles.MaintenanceManager}")]
    [ProducesResponseType(typeof(ApiResponse<IncidentResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> MarkDuplicate(Guid id, Guid relatedIncidentId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(ApiResponse.Fail("User not authenticated."));
        }

        var (success, response, error) = await _markIncidentAsDuplicateHandler.HandleAsync(id, relatedIncidentId, userId);
        if (!success)
        {
            if (error == "Incident not found." || error == "Related incident not found.")
            {
                return NotFound(ApiResponse.Fail(error));
            }

            return BadRequest(ApiResponse.Fail(error!));
        }

        return Ok(ApiResponse<IncidentResponse>.Ok(response!, "Incident marked as duplicate successfully."));
    }
}
