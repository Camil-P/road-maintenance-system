using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RoadMaintenance.Domain.Entities;
using RoadMaintenance.Infrastructure.Identity;

namespace RoadMaintenance.Infrastructure.Persistence;

/// <summary>
/// Main database context for the Road Maintenance application.
/// Combines EF Core with ASP.NET Core Identity.
/// </summary>
public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
    
    public DbSet<RoadSegment> RoadSegments => Set<RoadSegment>();
    public DbSet<InfrastructureAsset> InfrastructureAssets => Set<InfrastructureAsset>();
    public DbSet<IncidentReport> IncidentReports => Set<IncidentReport>();
    public DbSet<WorkOrder> WorkOrders => Set<WorkOrder>();
    public DbSet<MaterialStock> MaterialStocks => Set<MaterialStock>();
    public DbSet<Machine> Machines => Set<Machine>();
    
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
        // Apply all entity configurations from this assembly
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
