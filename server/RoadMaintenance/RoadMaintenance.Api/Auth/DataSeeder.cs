using Microsoft.AspNetCore.Identity;
using RoadMaintenance.Infrastructure.Identity;
using RoadMaintenance.Infrastructure.Persistence;

namespace RoadMaintenance.Api.Auth;

/// <summary>
/// Seeds initial roles and optionally an admin user.
/// Called at application startup.
/// </summary>
public static class DataSeeder
{
    public static async Task SeedRolesAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        
        foreach (var roleName in ApplicationRoles.AllRoles)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
            }
        }
    }

    public static async Task SeedAdminUserAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        var adminEmail = "cplojovic@gmail.com";
        var adminPassword = "Camil!123";

        if (await userManager.FindByEmailAsync(adminEmail) == null)
        {
            var adminUser = new ApplicationUser { UserName = adminEmail, Email = adminEmail };
            await userManager.CreateAsync(adminUser, adminPassword);
            await userManager.AddToRoleAsync(adminUser, "Admin");
        }
    }

    public static async Task SeedDatabaseAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var services = scope.ServiceProvider;

        var context = services.GetRequiredService<AppDbContext>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

        // 1. Ensure DB exists
        await context.Database.EnsureCreatedAsync();

        // 2. Seed Roles
        foreach (var roleName in ApplicationRoles.AllRoles)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
            }
        }

        // 3. Seed Admin
        var adminEmail = "cplojovic@gmail.com";
        if (await userManager.FindByEmailAsync(adminEmail) == null)
        {
            var adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true // Good practice
            };
            var result = await userManager.CreateAsync(adminUser, "Camil!123");

            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, ApplicationRoles.Admin);
            }
            else
            {
                // Log result.Errors here - this is likely why your UserRoles table is empty!
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Admin seeding failed: {errors}");
            }
        }
    }
}
