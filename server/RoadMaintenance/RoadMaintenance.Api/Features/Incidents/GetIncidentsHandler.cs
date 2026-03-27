using Microsoft.EntityFrameworkCore;
using RoadMaintenance.Api.Features.Incidents.Contracts;
using RoadMaintenance.Domain.Entities;
using RoadMaintenance.Domain.Enums;
using RoadMaintenance.Infrastructure.Persistence;

namespace RoadMaintenance.Api.Features.Incidents;

/// <summary>
/// Handler for querying incidents with filtering and pagination.
/// Follows SRP: one use case, one handler.
/// </summary>
public interface IGetIncidentsHandler
{
    Task<PaginatedResponse<IncidentResponse>> HandleAsync(GetIncidentsQuery query);
}

public class GetIncidentsHandler : IGetIncidentsHandler
{
    private readonly AppDbContext _context;
    
    public GetIncidentsHandler(AppDbContext context)
    {
        _context = context;
    }
    
    public async Task<PaginatedResponse<IncidentResponse>> HandleAsync(GetIncidentsQuery query)
    {
        // Start with base query
        var incidentsQuery = _context.IncidentReports
            .AsNoTracking()
            .Include(i => i.RoadSegment)
            .AsQueryable();
        
        // Apply filters
        if (query.Status.HasValue)
        {
            incidentsQuery = incidentsQuery.Where(i => i.Status == query.Status.Value);
        }
        
        if (query.Type.HasValue)
        {
            incidentsQuery = incidentsQuery.Where(i => i.Type == query.Type.Value);
        }
        
        if (query.RoadSegmentId.HasValue)
        {
            incidentsQuery = incidentsQuery.Where(i => i.RoadSegmentId == query.RoadSegmentId.Value);
        }
        
        if (query.FromDate.HasValue)
        {
            incidentsQuery = incidentsQuery.Where(i => i.ReportedAt >= query.FromDate.Value);
        }
        
        if (query.ToDate.HasValue)
        {
            incidentsQuery = incidentsQuery.Where(i => i.ReportedAt <= query.ToDate.Value);
        }
        
        if (!string.IsNullOrEmpty(query.ReportedByUserId))
        {
            incidentsQuery = incidentsQuery.Where(i => i.ReportedByUserId == query.ReportedByUserId);
        }
        
        // Get total count before pagination
        var totalCount = await incidentsQuery.CountAsync();
        
        // Apply ordering and pagination
        var incidents = await incidentsQuery
            .OrderByDescending(i => i.ReportedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();
        
        // Map to response
        var items = incidents.Select(MapToResponse);
        
        return new PaginatedResponse<IncidentResponse>
        {
            Items = items,
            TotalCount = totalCount,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }
    
    private static IncidentResponse MapToResponse(IncidentReport incident)
    {
        return new IncidentResponse
        {
            Id = incident.Id,
            Type = incident.Type,
            TypeName = GetIncidentTypeName(incident.Type),
            Status = incident.Status,
            StatusName = incident.Status.ToString(),
            Description = incident.Description,
            Latitude = incident.Latitude,
            Longitude = incident.Longitude,
            LocationDescription = incident.LocationDescription,
            RoadSegmentId = incident.RoadSegmentId,
            RoadSegmentName = incident.RoadSegment?.Name,
            ReportedByUserId = incident.ReportedByUserId,
            ReportedAt = incident.ReportedAt,
            VerifiedAt = incident.VerifiedAt,
            ResolvedAt = incident.ResolvedAt,
            HasPotentialDuplicates = false,
            PotentialDuplicateIds = null
        };
    }
    private static string GetIncidentTypeName(IncidentType type)
    {
        return type switch
        {
            IncidentType.Pothole => "Pothole",
            IncidentType.Ice => "Ice",
            IncidentType.TrafficLightIssue => "Traffic Light Issue",
            IncidentType.SignIssue => "Sign Issue",
            IncidentType.RoadMarkingIssue => "Road Marking Issue",
            IncidentType.Debris => "Debris",
            IncidentType.Flooding => "Flooding",
            IncidentType.GuardrailDamage => "Guardrail Damage",
            IncidentType.Other => "Other",

            // This catches the '0' values in your database or any other undefined numbers
            _ => "Unspecified (0)"
        };
    }
}
