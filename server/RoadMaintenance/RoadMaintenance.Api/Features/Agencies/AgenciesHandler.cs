using Microsoft.EntityFrameworkCore;
using NetTopologySuite.IO; // Za parsiranje GeoJSON-a
using RoadMaintenance.Api.Features.Agencies.Contracts;
using RoadMaintenance.Infrastructure.Persistence;

namespace RoadMaintenance.Api.Features.Agencies;

public interface IAgenciesHandler
{
    Task<IEnumerable<AgencyResponse>> GetAllAsync();
    Task<AgencyResponse?> GetByIdAsync(Guid id);
    Task<(bool Success, AgencyResponse? Response, string? Error)> CreateAsync(CreateAgencyRequest request);
    Task<(bool Success, AgencyResponse? Response, string? Error)> UpdateAsync(Guid id, UpdateAgencyRequest request);
}

public class AgenciesHandler(AppDbContext context) : IAgenciesHandler
{
    private readonly AppDbContext _context = context;

    public async Task<IEnumerable<AgencyResponse>> GetAllAsync()
    {
        var items = await _context.Set<Domain.Entities.Agency>()
            .AsNoTracking()
            .OrderBy(a => a.Name)
            .ToListAsync();

        return items.Select(MapToResponse);
    }

    public async Task<AgencyResponse?> GetByIdAsync(Guid id)
    {
        var item = await _context.Set<Domain.Entities.Agency>().AsNoTracking().FirstOrDefaultAsync(a => a.Id == id);
        return item is null ? null : MapToResponse(item);
    }

    public async Task<(bool Success, AgencyResponse? Response, string? Error)> CreateAsync(CreateAgencyRequest request)
    {
        try
        {
            // Parsiranje GeoJSON stringa u NTS Polygon (pojednostavljeno)
            NetTopologySuite.Geometries.Polygon? polygon = null;
            if (!string.IsNullOrEmpty(request.RegionGeoJson))
            {
                var reader = new GeoJsonReader();
                polygon = reader.Read<NetTopologySuite.Geometries.Polygon>(request.RegionGeoJson);
            }

            var agency = Domain.Entities.Agency.Create(request.Name.Trim(), polygon);

            _context.Add(agency);
            await _context.SaveChangesAsync();

            return (true, MapToResponse(agency), null);
        }
        catch (Exception ex)
        {
            return (false, null, ex.Message);
        }
    }

    public async Task<(bool Success, AgencyResponse? Response, string? Error)> UpdateAsync(Guid id, UpdateAgencyRequest request)
    {
        var agency = await _context.Set<Domain.Entities.Agency>().FirstOrDefaultAsync(a => a.Id == id);
        if (agency is null)
        {
            return (false, null, "Agency not found.");
        }

        try
        {
            NetTopologySuite.Geometries.Polygon? polygon = null;
            if (!string.IsNullOrEmpty(request.RegionGeoJson))
            {
                var reader = new GeoJsonReader();
                polygon = reader.Read<NetTopologySuite.Geometries.Polygon>(request.RegionGeoJson);
            }

            agency.UpdateDetails(request.Name.Trim(), polygon);
            await _context.SaveChangesAsync();

            return (true, MapToResponse(agency), null);
        }
        catch (Exception ex)
        {
            return (false, null, ex.Message);
        }
    }

    private static AgencyResponse MapToResponse(Domain.Entities.Agency agency)
    {
        return new AgencyResponse
        {
            Id = agency.Id,
            Name = agency.Name,
            IsActive = agency.IsActive,
            CreatedAt = agency.CreatedAt,
            // Pretvaranje NTS Polygon-a nazad u string za Frontend
            RegionGeoJson = agency.RegionBoundary != null ? new GeoJsonWriter().Write(agency.RegionBoundary) : null
        };
    }
}