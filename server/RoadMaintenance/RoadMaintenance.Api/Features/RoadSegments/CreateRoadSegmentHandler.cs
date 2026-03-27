using RoadMaintenance.Api.Features.RoadSegments.Contracts;
using RoadMaintenance.Domain.Entities;
using RoadMaintenance.Infrastructure.Persistence;

namespace RoadMaintenance.Api.Features.RoadSegments;

public interface ICreateRoadSegmentHandler
{
    Task<(bool Success, RoadSegmentResponse? Response, string? Error)> HandleAsync(CreateRoadSegmentRequest request);
}

public class CreateRoadSegmentHandler : ICreateRoadSegmentHandler
{
    private readonly AppDbContext _context;

    public CreateRoadSegmentHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(bool Success, RoadSegmentResponse? Response, string? Error)> HandleAsync(CreateRoadSegmentRequest request)
    {
        try
        {
            // Use the domain factory method to ensure all invariants are satisfied
            var segment = RoadSegment.Create(
                name: request.Name,
                category: request.Category,
                lengthKm: request.LengthKm,
                description: request.Description,
                startLatitude: request.StartLatitude,
                startLongitude: request.StartLongitude,
                endLatitude: request.EndLatitude,
                endLongitude: request.EndLongitude
            );

            _context.RoadSegments.Add(segment);
            await _context.SaveChangesAsync();

            return (true, RoadSegmentMapper.MapToResponse(segment), null);
        }
        catch (ArgumentException ex)
        {
            // Catches domain validation rules (e.g., negative length)
            return (false, null, ex.Message);
        }
    }
}