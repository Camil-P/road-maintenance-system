using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoadMaintenance.Api.Common;
using RoadMaintenance.Api.Features.Agencies.Contracts;
using RoadMaintenance.Infrastructure.Identity;

namespace RoadMaintenance.Api.Features.Agencies;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = ApplicationRoles.Admin)] // Samo sistemski admin (ti) može upravljati agencijama
public class AgenciesController(IAgenciesHandler agenciesHandler) : ControllerBase
{
    private readonly IAgenciesHandler _agenciesHandler = agenciesHandler;

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<AgencyResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var result = await _agenciesHandler.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<AgencyResponse>>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<AgencyResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _agenciesHandler.GetByIdAsync(id);
        if (result is null)
            return NotFound(ApiResponse.Fail("Agency not found."));

        return Ok(ApiResponse<AgencyResponse>.Ok(result));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<AgencyResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateAgencyRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse.Fail("Validation failed.", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));

        var (success, response, error) = await _agenciesHandler.CreateAsync(request);
        if (!success)
            return BadRequest(ApiResponse.Fail(error!));

        return CreatedAtAction(nameof(GetById), new { id = response!.Id }, ApiResponse<AgencyResponse>.Ok(response));
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<AgencyResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAgencyRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse.Fail("Validation failed.", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));

        var (success, response, error) = await _agenciesHandler.UpdateAsync(id, request);
        if (!success)
            return error == "Agency not found." ? NotFound(ApiResponse.Fail(error)) : BadRequest(ApiResponse.Fail(error!));

        return Ok(ApiResponse<AgencyResponse>.Ok(response!));
    }
}