using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RoadMaintenance.Domain.Services;
using RoadMaintenance.Infrastructure.Identity;
using RoadMaintenance.Infrastructure.Persistence;
using RoadMaintenance.Infrastructure.Services;

namespace RoadMaintenance.Infrastructure;

/// <summary>
/// Extension methods for registering Infrastructure services with DI.
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds Infrastructure services including EF Core, Identity, and domain service implementations.
    /// </summary>
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Add DbContext
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                sqlOptions =>
                {
                    sqlOptions.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName);
                    sqlOptions.EnableRetryOnFailure(maxRetryCount: 3);

                    sqlOptions.UseNetTopologySuite();
                }));

        // Add ASP.NET Core Identity
        services.AddIdentity<ApplicationUser, IdentityRole>(options =>
            {
                // Password settings
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequiredLength = 8;
                
                // User settings
                options.User.RequireUniqueEmail = true;
                
                // Sign-in settings
                options.SignIn.RequireConfirmedEmail = false; // Simplified for v1
            })
            .AddEntityFrameworkStores<AppDbContext>()
            .AddDefaultTokenProviders();
        
        // Register domain services
        services.AddScoped<ILocationService, SimpleLocationService>();
        services.AddScoped<IWorkOrderPriorityService, WorkOrderPriorityService>();
        
        return services;
    }
}
