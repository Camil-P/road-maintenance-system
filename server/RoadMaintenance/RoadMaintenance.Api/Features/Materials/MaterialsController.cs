using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoadMaintenance.Api.Common;
using RoadMaintenance.Api.Features.Materials.Contracts;
using RoadMaintenance.Infrastructure.Identity;

namespace RoadMaintenance.Api.Features.Materials;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MaterialsController(IMaterialsHandler materialsHandler) : ControllerBase
{
    private readonly IMaterialsHandler _materialsHandler = materialsHandler;

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<MaterialResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var result = await _materialsHandler.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<MaterialResponse>>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<MaterialResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _materialsHandler.GetByIdAsync(id);
        if (result is null)
        {
            return NotFound(ApiResponse.Fail("Material not found."));
        }

        return Ok(ApiResponse<MaterialResponse>.Ok(result));
    }

    [HttpPost]
    [Authorize(Roles = $"{ApplicationRoles.Admin},{ApplicationRoles.Dispatcher},{ApplicationRoles.MaintenanceManager}")]
    [ProducesResponseType(typeof(ApiResponse<MaterialResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateMaterialRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
            return BadRequest(ApiResponse.Fail("Validation failed.", errors));
        }

        var (success, response, error) = await _materialsHandler.CreateAsync(request);
        if (!success)
        {
            return BadRequest(ApiResponse.Fail(error!));
        }

        return CreatedAtAction(nameof(GetById), new { id = response!.Id }, ApiResponse<MaterialResponse>.Ok(response));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = $"{ApplicationRoles.Admin},{ApplicationRoles.Dispatcher},{ApplicationRoles.MaintenanceManager}")]
    [ProducesResponseType(typeof(ApiResponse<MaterialResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateMaterialRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
            return BadRequest(ApiResponse.Fail("Validation failed.", errors));
        }

        var (success, response, error) = await _materialsHandler.UpdateAsync(id, request);
        if (!success)
        {
            if (error == "Material not found.")
            {
                return NotFound(ApiResponse.Fail(error));
            }

            return BadRequest(ApiResponse.Fail(error!));
        }

        return Ok(ApiResponse<MaterialResponse>.Ok(response!));
    }

    [HttpPatch("{id:guid}/stock/add")]
    [Authorize(Roles = $"{ApplicationRoles.Admin},{ApplicationRoles.Dispatcher},{ApplicationRoles.MaintenanceManager}")]
    [ProducesResponseType(typeof(ApiResponse<MaterialResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddStock(Guid id, [FromBody] AdjustMaterialStockRequest request)
    {
        var (success, response, error) = await _materialsHandler.AddStockAsync(id, request);
        if (!success)
        {
            if (error == "Material not found.")
            {
                return NotFound(ApiResponse.Fail(error));
            }

            return BadRequest(ApiResponse.Fail(error!));
        }

        return Ok(ApiResponse<MaterialResponse>.Ok(response!, "Stock updated successfully."));
    }

    [HttpPatch("{id:guid}/stock/consume")]
    [Authorize(Roles = $"{ApplicationRoles.Admin},{ApplicationRoles.Dispatcher},{ApplicationRoles.MaintenanceManager},{ApplicationRoles.FieldWorker}")]
    [ProducesResponseType(typeof(ApiResponse<MaterialResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ConsumeStock(Guid id, [FromBody] AdjustMaterialStockRequest request)
    {
        var (success, response, error) = await _materialsHandler.ConsumeStockAsync(id, request);
        if (!success)
        {
            if (error == "Material not found." || error == "Work order not found.")
            {
                return NotFound(ApiResponse.Fail(error));
            }

            return BadRequest(ApiResponse.Fail(error!));
        }

        return Ok(ApiResponse<MaterialResponse>.Ok(response!, "Stock consumed successfully."));
    }
}
