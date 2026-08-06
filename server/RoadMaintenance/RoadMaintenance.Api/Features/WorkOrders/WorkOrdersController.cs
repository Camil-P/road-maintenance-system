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
    IUpdateWorkOrderStatusHandler updateStatusHandler,
    IAssignWorkerHandler assignWorkerHandler,
    IRemoveWorkerHandler removeWorkerHandler,
    IAddMaterialHandler addMaterialHandler
    ) : ControllerBase
{
    private readonly ICreateWorkOrderHandler _createHandler = createHandler;
    private readonly IGetWorkOrdersHandler _getWorkOrdersHandler = getWorkOrdersHandler;
    private readonly IGetWorkOrderByIdHandler _getByIdHandler = getByIdHandler;
    private readonly IUpdateWorkOrderStatusHandler _updateStatusHandler = updateStatusHandler;
    private readonly IUpdateWorkOrderWorkersHandler _assignWorkerHandler = assignWorkerHandler;
    private readonly IRemoveWorkerHandler _removeWorkerHandler = removeWorkerHandler;
    private readonly IAddMaterialHandler _addMaterialHandler = addMaterialHandler;

    [HttpPost]
    [Authorize(Roles = $"{ApplicationRoles.Admin},{ApplicationRoles.Dispatcher},{ApplicationRoles.MaintenanceManager}")]
    [ProducesResponseType(typeof(ApiResponse<WorkOrderResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateWorkOrder([FromBody] CreateWorkOrderRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse.Fail("Validation failed."));

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var (success, response, error) = await _createHandler.HandleAsync(request, userId!);

        if (!success)
            return BadRequest(ApiResponse.Fail(error!));

        return CreatedAtAction(nameof(GetWorkOrderById), new { id = response!.Id }, 
            ApiResponse<WorkOrderResponse>.Ok(response, "Work order created successfully."));
    }

    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResponse<WorkOrderResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetWorkOrders([FromQuery] GetWorkOrdersQuery query)
    {
        var isWorker = User.IsInRole(ApplicationRoles.FieldWorker) &&
                       !User.IsInRole(ApplicationRoles.Dispatcher) &&
                       !User.IsInRole(ApplicationRoles.MaintenanceManager) &&
                       !User.IsInRole(ApplicationRoles.Admin);

        if (isWorker)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(userId, out var workerGuid))
            {
                query.AssignedWorkerId = workerGuid;
            }
        }

        var result = await _getWorkOrdersHandler.HandleAsync(query);
        return Ok(ApiResponse<PaginatedResponse<WorkOrderResponse>>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<WorkOrderResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetWorkOrderById(Guid id)
    {
        var workOrder = await _getByIdHandler.HandleAsync(id);

        if (workOrder is null)
            return NotFound(ApiResponse.Fail("Work order not found."));

        var isWorker = User.IsInRole(ApplicationRoles.FieldWorker) &&
                       !User.IsInRole(ApplicationRoles.Dispatcher) &&
                       !User.IsInRole(ApplicationRoles.MaintenanceManager) &&
                       !User.IsInRole(ApplicationRoles.Admin);

        if (isWorker)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(userId, out var workerGuid) && !workOrder.AssignedWorkerIds.Contains(workerGuid))
            {
                return NotFound(ApiResponse.Fail("Work order not found or you are not assigned to it."));
            }
        }

        return Ok(ApiResponse<WorkOrderResponse>.Ok(workOrder));
    }

    [HttpGet("my")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResponse<WorkOrderResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyWorkOrders([FromQuery] GetWorkOrdersQuery query)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userId, out var workerGuid))
        {
            query.AssignedWorkerId = workerGuid;
        }

        var result = await _getWorkOrdersHandler.HandleAsync(query);
        return Ok(ApiResponse<PaginatedResponse<WorkOrderResponse>>.Ok(result));
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<WorkOrderResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateWorkOrderStatus(Guid id, [FromBody] UpdateWorkOrderStatusRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse.Fail("Validation failed."));

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var (success, response, error) = await _updateStatusHandler.HandleAsync(id, request, userId!);

        if (!success)
        {
            if (error == "Work order not found.")
                return NotFound(ApiResponse.Fail(error));
            return BadRequest(ApiResponse.Fail(error!));
        }

        return Ok(ApiResponse<WorkOrderResponse>.Ok(response!, "Work order status updated successfully."));
    }

    /// <summary>
    /// Updates the entire list of assigned workers for a work order.
    /// </summary>
    [HttpPut("{id:guid}/workers")]
    [Authorize(Roles = $"{ApplicationRoles.Admin},{ApplicationRoles.Dispatcher}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateWorkers(
        Guid id, 
        [FromBody] AssignWorkersRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse.Fail("Validation failed."));

        var (success, error) = await handler.HandleAsync(id, request.WorkerIds);

        if (!success)
        {
            if (error == "Work order not found.")
                return NotFound(ApiResponse.Fail(error));
                
            return BadRequest(ApiResponse.Fail(error!));
        }

        return Ok(ApiResponse.Ok("Assigned workers updated successfully."));
    }

    /// <summary>
    /// Adds material usage to a work order.
    /// </summary>
    [HttpPost("{id:guid}/materials")]
    [Authorize(Roles = $"{ApplicationRoles.Admin},{ApplicationRoles.Dispatcher},{ApplicationRoles.FieldWorker}")]
    public async Task<IActionResult> AddMaterial(Guid id, [FromBody] AddMaterialRequest request, [FromServices] IAddMaterialHandler handler)
    {
        var (success, error) = await handler.HandleAsync(id, request.MaterialStockId, request.Quantity);

        if (!success) return BadRequest(ApiResponse.Fail(error!));

        return Ok(ApiResponse.Ok("Material added successfully."));
    }
}