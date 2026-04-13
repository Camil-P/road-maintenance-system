using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoadMaintenance.Api.Features.Map;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MapController : ControllerBase
{
    private readonly IMapHandler _handler;

    public MapController(IMapHandler handler)
    {
        _handler = handler;
    }

    [HttpGet("geojson")]
    public async Task<IActionResult> GetGeoJson()
    {
        var geojson = await _handler.GetGeoJsonAsync();
        return Ok(geojson);
    }
}
