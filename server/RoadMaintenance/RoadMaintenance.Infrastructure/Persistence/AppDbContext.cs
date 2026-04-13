using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RoadMaintenance.Domain.Entities;
using RoadMaintenance.Domain.Interfaces;
using RoadMaintenance.Infrastructure.Identity;
using RoadMaintenance.Infrastructure.Interfaces;

namespace RoadMaintenance.Infrastructure.Persistence;

/// <summary>
/// Main database context for the Road Maintenance application.
/// Combines EF Core with ASP.NET Core Identity.
/// </summary>
public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    private readonly ICurrentUserService _currentUserService;
    public AppDbContext(DbContextOptions<AppDbContext> options, ICurrentUserService currentUserService) : base(options)
    {
        _currentUserService = currentUserService;
    }
    
    public DbSet<Agency> Agencies => Set<Agency>();
    public DbSet<RoadSegment> RoadSegments => Set<RoadSegment>();
    public DbSet<InfrastructureAsset> InfrastructureAssets => Set<InfrastructureAsset>();
    public DbSet<IncidentReport> IncidentReports => Set<IncidentReport>();
    public DbSet<WorkOrder> WorkOrders => Set<WorkOrder>();
    public DbSet<MaterialStock> MaterialStocks => Set<MaterialStock>();
    public DbSet<Machine> Machines => Set<Machine>();
    
    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.HasPostgresExtension("postgis");

        base.OnModelCreating(builder);
        
        // Apply all entity configurations from this assembly
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        var currentAgencyId = _currentUserService.AgencyId;

        // Primeni filter na sve entitete koji implementiraju IMustHaveTenant
        builder.Entity<Machine>().HasQueryFilter(x => currentAgencyId == null || x.AgencyId == currentAgencyId);
        builder.Entity<IncidentReport>().HasQueryFilter(x => currentAgencyId == null || x.AgencyId == currentAgencyId);
        builder.Entity<RoadSegment>().HasQueryFilter(x => currentAgencyId == null || x.AgencyId == currentAgencyId);
        builder.Entity<InfrastructureAsset>().HasQueryFilter(x => currentAgencyId == null || x.AgencyId == currentAgencyId);
        builder.Entity<WorkOrder>().HasQueryFilter(x => currentAgencyId == null || x.AgencyId == currentAgencyId);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var currentAgencyId = _currentUserService.AgencyId;

        // Pronađi sve entitete koji su ubačeni u bazu (Added) ili modifikovani,
        // a koji implementiraju naš IMustHaveTenant interfejs
        foreach (var entry in ChangeTracker.Entries<IMustHaveTenant>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    // Ako je korisnik deo agencije, a pokušava da ubaci zapis,
                    // automatski forsira taj AgencyId (sprečava i zlonamerne upite)
                    if (currentAgencyId.HasValue)
                    {
                        entry.Entity.AgencyId = currentAgencyId.Value;
                    }
                    break;

                case EntityState.Modified:
                    // Ako trenutni korisnik pripada nekoj agenciji (nije SuperAdmin),
                    // strogo mu zabranjujemo da menja vlasništvo (AgencyId) nad ovim resursom.
                    if (currentAgencyId.HasValue)
                    {
                        // Ova linija koda efektivno kaže Entity Frameworku: 
                        // "Čak i ako je neko promenio vrednost AgencyId u objektu, 
                        // ignoriši tu promenu i nemoj je slati u UPDATE SQL upit."
                        entry.Property(x => x.AgencyId).IsModified = false;
                    }
                    break;
            }
        }

        // Pozivamo osnovnu metodu koja zapravo šalje SQL u bazu
        return await base.SaveChangesAsync(cancellationToken);
    }
}
