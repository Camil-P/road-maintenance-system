using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoadMaintenance.Api.Common;
using RoadMaintenance.Api.Features.Machines.Contracts;
using RoadMaintenance.Infrastructure.Identity;

namespace RoadMaintenance.Api.Features.Machines;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MachinesController(IMachinesHandler machinesHandler) : ControllerBase
{
    private readonly IMachinesHandler _machinesHandler = machinesHandler;

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<MachineResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var result = await _machinesHandler.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<MachineResponse>>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<MachineResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _machinesHandler.GetByIdAsync(id);
        if (result is null)
        {
            return NotFound(ApiResponse.Fail("Machine not found."));
        }

        return Ok(ApiResponse<MachineResponse>.Ok(result));
    }

    [HttpPost]
    [Authorize(Roles = $"{ApplicationRoles.Admin},{ApplicationRoles.Dispatcher},{ApplicationRoles.MaintenanceManager}")]
    [ProducesResponseType(typeof(ApiResponse<MachineResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateMachineRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
            return BadRequest(ApiResponse.Fail("Validation failed.", errors));
        }

        var (success, response, error) = await _machinesHandler.CreateAsync(request);
        if (!success)
        {
            return BadRequest(ApiResponse.Fail(error!));
        }

        return CreatedAtAction(nameof(GetById), new { id = response!.Id }, ApiResponse<MachineResponse>.Ok(response));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = $"{ApplicationRoles.Admin},{ApplicationRoles.Dispatcher},{ApplicationRoles.MaintenanceManager}")]
    [ProducesResponseType(typeof(ApiResponse<MachineResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateMachineRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
            return BadRequest(ApiResponse.Fail("Validation failed.", errors));
        }

        var (success, response, error) = await _machinesHandler.UpdateAsync(id, request);
        if (!success)
        {
            if (error == "Machine not found.")
            {
                return NotFound(ApiResponse.Fail(error));
            }

            return BadRequest(ApiResponse.Fail(error!));
        }

        return Ok(ApiResponse<MachineResponse>.Ok(response!));
    }

    [HttpPatch("{id:guid}/operational")]
    [Authorize(Roles = $"{ApplicationRoles.Admin},{ApplicationRoles.Dispatcher},{ApplicationRoles.MaintenanceManager}")]
    [ProducesResponseType(typeof(ApiResponse<MachineResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetOperationalStatus(Guid id, [FromBody] SetMachineOperationalRequest request)
    {
        var (success, response, error) = await _machinesHandler.SetOperationalStatusAsync(id, request);
        if (!success)
        {
            if (error == "Machine not found.")
            {
                return NotFound(ApiResponse.Fail(error));
            }

            return BadRequest(ApiResponse.Fail(error!));
        }

        return Ok(ApiResponse<MachineResponse>.Ok(response!, "Machine status updated successfully."));
    }

    [HttpPatch("{id:guid}/maintenance")]
    [Authorize(Roles = $"{ApplicationRoles.Admin},{ApplicationRoles.Dispatcher},{ApplicationRoles.MaintenanceManager},{ApplicationRoles.FieldWorker}")]
    [ProducesResponseType(typeof(ApiResponse<MachineResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RecordMaintenance(Guid id, [FromBody] RecordMaintenanceRequest request)
    {
        var (success, response, error) = await _machinesHandler.RecordMaintenanceAsync(id, request);
        if (!success)
        {
            if (error == "Machine not found.")
            {
                return NotFound(ApiResponse.Fail(error));
            }

            return BadRequest(ApiResponse.Fail(error!));
        }

        return Ok(ApiResponse<MachineResponse>.Ok(response!, "Maintenance recorded successfully."));
    }
}
