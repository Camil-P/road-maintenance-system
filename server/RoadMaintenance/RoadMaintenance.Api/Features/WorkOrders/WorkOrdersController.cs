using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoadMaintenance.Api.Common;
using RoadMaintenance.Api.Features.Incidents.Contracts;
using RoadMaintenance.Api.Features.WorkOrders.Contracts;
using RoadMaintenance.Infrastructure.Identity;
using System.Security.Claims;

namespace RoadMaintenance.Api.Features.WorkOrders;

[ApiController]
[Route("api/[controller]")]
public class WorkOrdersController(
    ICreateWorkOrderHandler createHandler,
    IGetWorkOrdersHandler getWorkOrdersHandler,
    IGetWorkOrderByIdHandler getByIdHandler,
    IUpdateWorkOrderStatusHandler updateStatusHandler) : ControllerBase
{
    private readonly ICreateWorkOrderHandler _createHandler = createHandler;
    private readonly IGetWorkOrdersHandler _getWorkOrdersHandler = getWorkOrdersHandler;
    private readonly IGetWorkOrderByIdHandler _getByIdHandler = getByIdHandler;
    private readonly IUpdateWorkOrderStatusHandler _updateStatusHandler = updateStatusHandler;

    /// <summary>
    /// Creates a new work order. Accessible by Dispatchers, Maintenance Managers, and Admins.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = $"{ApplicationRoles.Admin},{ApplicationRoles.Dispatcher},{ApplicationRoles.MaintenanceManager}")]
    [ProducesResponseType(typeof(ApiResponse<WorkOrderResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateWorkOrder([FromBody] CreateWorkOrderRequest request)
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

        var (success, response, error) = await _createHandler.HandleAsync(request, userId);

        if (!success)
        {
            return BadRequest(ApiResponse.Fail(error!));
        }

        return CreatedAtAction(
            nameof(GetWorkOrderById),
            new { id = response!.Id },
            ApiResponse<WorkOrderResponse>.Ok(response, "Work order created successfully."));
    }

    /// <summary>
    /// Gets a paginated list of work orders with optional filters.
    /// </summary>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResponse<WorkOrderResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetWorkOrders([FromQuery] GetWorkOrdersQuery query)
    {
        // If user is a Maintenance Worker, restrict to their assigned work orders only
        var isWorker = User.IsInRole(ApplicationRoles.FieldWorker) &&
                       !User.IsInRole(ApplicationRoles.Dispatcher) &&
                       !User.IsInRole(ApplicationRoles.MaintenanceManager) &&
                       !User.IsInRole(ApplicationRoles.Admin);

        if (isWorker)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            query.AssignedToUserId = userId;
        }

        var result = await _getWorkOrdersHandler.HandleAsync(query);

        return Ok(ApiResponse<PaginatedResponse<WorkOrderResponse>>.Ok(result));
    }

    /// <summary>
    /// Gets a specific work order by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<WorkOrderResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetWorkOrderById(Guid id)
    {
        var workOrder = await _getByIdHandler.HandleAsync(id);

        if (workOrder is null)
        {
            return NotFound(ApiResponse.Fail("Work order not found."));
        }

        // Apply read-access restrictions if necessary (e.g., workers only see their assigned orders)
        var isWorker = User.IsInRole(ApplicationRoles.FieldWorker) &&
                       !User.IsInRole(ApplicationRoles.Dispatcher) &&
                       !User.IsInRole(ApplicationRoles.MaintenanceManager) &&
                       !User.IsInRole(ApplicationRoles.Admin);

        if (isWorker)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (workOrder.AssignedToUserId != userId)
            {
                return NotFound(ApiResponse.Fail("Work order not found."));
            }
        }

        return Ok(ApiResponse<WorkOrderResponse>.Ok(workOrder));
    }

    /// <summary>
    /// Gets work orders assigned to the current user.
    /// </summary>
    [HttpGet("my")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResponse<WorkOrderResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyWorkOrders([FromQuery] GetWorkOrdersQuery query)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(ApiResponse.Fail("User not authenticated."));
        }

        query.AssignedToUserId = userId;

        var result = await _getWorkOrdersHandler.HandleAsync(query);

        return Ok(ApiResponse<PaginatedResponse<WorkOrderResponse>>.Ok(result));
    }

    /// <summary>
    /// Updates the status of an existing work order.
    /// </summary>
    [HttpPatch("{id:guid}/status")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<WorkOrderResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdateWorkOrderStatus(Guid id, [FromBody] UpdateWorkOrderStatusRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage);
            return BadRequest(ApiResponse.Fail("Validation failed.", errors));
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // This handler should ideally check if the user is authorized to update this specific order 
        // (e.g., they are the assignee or a manager).
        var (success, response, error) = await _updateStatusHandler.HandleAsync(id, request, userId!);

        if (!success)
        {
            if (error == "Work order not found.")
            {
                return NotFound(ApiResponse.Fail(error));
            }
            return BadRequest(ApiResponse.Fail(error!));
        }

        return Ok(ApiResponse<WorkOrderResponse>.Ok(response!, "Work order status updated successfully."));
    }
}