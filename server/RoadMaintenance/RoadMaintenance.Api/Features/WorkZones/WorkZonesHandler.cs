using Microsoft.EntityFrameworkCore;
using RoadMaintenance.Api.Features.WorkZones.Contracts;
using RoadMaintenance.Domain.Entities;
using RoadMaintenance.Infrastructure.Persistence;

namespace RoadMaintenance.Api.Features.WorkZones;

public interface IWorkZonesHandler
{
    Task<(bool Success, WorkZoneResponse? Response, string? Error)> CreateAsync(CreateWorkZoneRequest request, string userId);
    Task<List<WorkZoneResponse>> ListAsync();
    Task<WorkZoneDetailResponse?> GetByIdAsync(Guid id);
    Task<(bool Success, WorkZoneResponse? Response, string? Error)> UpdateProgressAsync(Guid id, UpdateWorkZoneProgressRequest request);
    Task<(bool Success, string? Error)> PauseAsync(Guid id);
    Task<(bool Success, string? Error)> ResumeAsync(Guid id);
    Task<(bool Success, string? Error)> CompleteAsync(Guid id, string note);
}

public class WorkZonesHandler : IWorkZonesHandler
{
    private readonly AppDbContext _context;

    public WorkZonesHandler(AppDbContext context) => _context = context;

    public async Task<(bool Success, WorkZoneResponse? Response, string? Error)> CreateAsync(
        CreateWorkZoneRequest request, string userId)
    {
        try
        {
            var zone = WorkZone.Create(
                name: request.Name,
                geometryJson: request.GeometryJson,
                lengthMeters: request.LengthMeters,
                affectedLane: request.AffectedLane,
                createdByUserId: userId);

            _context.WorkZones.Add(zone);
            await _context.SaveChangesAsync();
            return (true, MapToResponse(zone), null);
        }
        catch (ArgumentException ex)
        {
            return (false, null, ex.Message);
        }
    }

    public async Task<List<WorkZoneResponse>> ListAsync()
    {
        var zones = await _context.WorkZones
            .AsNoTracking()
            .Include(z => z.History)
            .OrderByDescending(z => z.UpdatedAt)
            .ToListAsync();

        return zones.Select(MapToResponse).ToList();
    }

    public async Task<WorkZoneDetailResponse?> GetByIdAsync(Guid id)
    {
        var zone = await _context.WorkZones
            .AsNoTracking()
            .Include(z => z.History.OrderByDescending(h => h.CreatedAt))
            .FirstOrDefaultAsync(z => z.Id == id);

        if (zone is null) return null;

        var response = new WorkZoneDetailResponse
        {
            Id = zone.Id,
            Name = zone.Name,
            GeometryJson = zone.GeometryJson,
            OriginalGeometryJson = zone.OriginalGeometryJson,
            OriginalLengthMeters = zone.OriginalLengthMeters,
            RemainingLengthMeters = zone.RemainingLengthMeters,
            CompletedLengthMeters = zone.OriginalLengthMeters - zone.RemainingLengthMeters,
            ProgressPercent = zone.OriginalLengthMeters > 0
                ? Math.Round((zone.OriginalLengthMeters - zone.RemainingLengthMeters) / zone.OriginalLengthMeters * 100, 1)
                : 0,
            AffectedLane = zone.AffectedLane,
            AffectedLaneName = zone.AffectedLane.ToString(),
            Status = zone.Status,
            StatusName = zone.Status.ToString(),
            CreatedAt = zone.CreatedAt,
            UpdatedAt = zone.UpdatedAt,
            HistoryCount = zone.History.Count,
            History = zone.History.Select(h => new WorkZoneHistoryResponse
            {
                Id = h.Id,
                GeometryJson = h.GeometryJson,
                TotalLengthMeters = h.TotalLengthMeters,
                CompletedMeters = h.CompletedMeters,
                Note = h.Note,
                CreatedAt = h.CreatedAt
            }).ToList()
        };

        return response;
    }

    public async Task<(bool Success, WorkZoneResponse? Response, string? Error)> UpdateProgressAsync(
        Guid id, UpdateWorkZoneProgressRequest request)
    {
        var zone = await _context.WorkZones
            .Include(z => z.History)
            .FirstOrDefaultAsync(z => z.Id == id);

        if (zone is null) return (false, null, "Work zone not found.");

        try
        {
            var history = zone.UpdateProgress(
                newGeometryJson: request.NewGeometryJson,
                newRemainingLengthMeters: request.NewRemainingLengthMeters,
                note: request.Note);

            _context.WorkZoneHistories.Add(history);
            await _context.SaveChangesAsync();
            return (true, MapToResponse(zone), null);
        }
        catch (InvalidOperationException ex)
        {
            return (false, null, ex.Message);
        }
    }

    public async Task<(bool Success, string? Error)> PauseAsync(Guid id)
    {
        var zone = await _context.WorkZones.FirstOrDefaultAsync(z => z.Id == id);
        if (zone is null) return (false, "Work zone not found.");
        try { zone.Pause(); await _context.SaveChangesAsync(); return (true, null); }
        catch (InvalidOperationException ex) { return (false, ex.Message); }
    }

    public async Task<(bool Success, string? Error)> ResumeAsync(Guid id)
    {
        var zone = await _context.WorkZones.FirstOrDefaultAsync(z => z.Id == id);
        if (zone is null) return (false, "Work zone not found.");
        try { zone.Resume(); await _context.SaveChangesAsync(); return (true, null); }
        catch (InvalidOperationException ex) { return (false, ex.Message); }
    }

    public async Task<(bool Success, string? Error)> CompleteAsync(Guid id, string note)
    {
        var zone = await _context.WorkZones
            .Include(z => z.History)
            .FirstOrDefaultAsync(z => z.Id == id);
        if (zone is null) return (false, "Work zone not found.");
        try { zone.Complete(note); await _context.SaveChangesAsync(); return (true, null); }
        catch (InvalidOperationException ex) { return (false, ex.Message); }
    }

    private static WorkZoneResponse MapToResponse(WorkZone zone) => new()
    {
        Id = zone.Id,
        Name = zone.Name,
        GeometryJson = zone.GeometryJson,
        OriginalGeometryJson = zone.OriginalGeometryJson,
        OriginalLengthMeters = zone.OriginalLengthMeters,
        RemainingLengthMeters = zone.RemainingLengthMeters,
        CompletedLengthMeters = zone.OriginalLengthMeters - zone.RemainingLengthMeters,
        ProgressPercent = zone.OriginalLengthMeters > 0
            ? Math.Round((zone.OriginalLengthMeters - zone.RemainingLengthMeters) / zone.OriginalLengthMeters * 100, 1)
            : 0,
        AffectedLane = zone.AffectedLane,
        AffectedLaneName = zone.AffectedLane.ToString(),
        Status = zone.Status,
        StatusName = zone.Status.ToString(),
        CreatedAt = zone.CreatedAt,
        UpdatedAt = zone.UpdatedAt,
        HistoryCount = zone.History.Count
    };
}
