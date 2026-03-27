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
                EmailConfirmed = true
            };
            var result = await userManager.CreateAsync(adminUser, "Camil!123");

            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, ApplicationRoles.Admin);
            }
            else
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Admin seeding failed: {errors}");
            }
        }

        // 4. Seed Mock Users
        await SeedMockUsersAsync(userManager);
    }

    private static async Task SeedMockUsersAsync(UserManager<ApplicationUser> userManager)
    {
        var mockUsers = new (ApplicationUser User, string Password, string Role)[]
        {
            (new ApplicationUser
            {
                Id = "550e8401-e29b-41d4-a716-446655440001",
                UserName = "stefan.nikolic@putevi.rs",
                Email = "stefan.nikolic@putevi.rs",
                FirstName = "Stefan",
                LastName = "Nikolić",
                PhoneNumber = "+381641000001",
                EmailConfirmed = true,
                IsActive = true
            }, "Test@1234!", ApplicationRoles.Admin),

            (new ApplicationUser
            {
                Id = "550e8401-e29b-41d4-a716-446655440002",
                UserName = "marija.petrovic@putevi.rs",
                Email = "marija.petrovic@putevi.rs",
                FirstName = "Marija",
                LastName = "Petrović",
                PhoneNumber = "+381641000002",
                EmailConfirmed = true,
                IsActive = true
            }, "Test@1234!", ApplicationRoles.MaintenanceManager),

            (new ApplicationUser
            {
                Id = "550e8401-e29b-41d4-a716-446655440003",
                UserName = "nikola.jovanovic@putevi.rs",
                Email = "nikola.jovanovic@putevi.rs",
                FirstName = "Nikola",
                LastName = "Jovanović",
                PhoneNumber = "+381641000003",
                EmailConfirmed = true,
                IsActive = true
            }, "Test@1234!", ApplicationRoles.Dispatcher),

            (new ApplicationUser
            {
                Id = "550e8401-e29b-41d4-a716-446655440004",
                UserName = "ana.djordjevic@putevi.rs",
                Email = "ana.djordjevic@putevi.rs",
                FirstName = "Ana",
                LastName = "Đorđević",
                PhoneNumber = "+381641000004",
                EmailConfirmed = true,
                IsActive = true
            }, "Test@1234!", ApplicationRoles.Dispatcher),

            (new ApplicationUser
            {
                Id = "550e8401-e29b-41d4-a716-446655440005",
                UserName = "dragan.stojanovic@putevi.rs",
                Email = "dragan.stojanovic@putevi.rs",
                FirstName = "Dragan",
                LastName = "Stojanović",
                PhoneNumber = "+381641000005",
                EmailConfirmed = true,
                IsActive = true
            }, "Test@1234!", ApplicationRoles.FieldWorker),

            (new ApplicationUser
            {
                Id = "550e8401-e29b-41d4-a716-446655440006",
                UserName = "vojislav.milovanovic@putevi.rs",
                Email = "vojislav.milovanovic@putevi.rs",
                FirstName = "Vojislav",
                LastName = "Milovanović",
                PhoneNumber = "+381641000006",
                EmailConfirmed = true,
                IsActive = true
            }, "Test@1234!", ApplicationRoles.FieldWorker),

            (new ApplicationUser
            {
                Id = "550e8401-e29b-41d4-a716-446655440007",
                UserName = "zoran.lazic@putevi.rs",
                Email = "zoran.lazic@putevi.rs",
                FirstName = "Zoran",
                LastName = "Lazić",
                PhoneNumber = "+381641000007",
                EmailConfirmed = true,
                IsActive = true
            }, "Test@1234!", ApplicationRoles.Driver),

            (new ApplicationUser
            {
                Id = "550e8401-e29b-41d4-a716-446655440008",
                UserName = "milica.ilic@putevi.rs",
                Email = "milica.ilic@putevi.rs",
                FirstName = "Milica",
                LastName = "Ilić",
                PhoneNumber = "+381641000008",
                EmailConfirmed = true,
                IsActive = true
            }, "Test@1234!", ApplicationRoles.Driver),

            (new ApplicationUser
            {
                Id = "550e8401-e29b-41d4-a716-446655440009",
                UserName = "petar.djuric@putevi.rs",
                Email = "petar.djuric@putevi.rs",
                FirstName = "Petar",
                LastName = "Đurić",
                PhoneNumber = "+381641000009",
                EmailConfirmed = true,
                IsActive = false
            }, "Test@1234!", ApplicationRoles.Driver),
        };

        foreach (var (user, password, role) in mockUsers)
        {
            if (await userManager.FindByEmailAsync(user.Email!) != null)
                continue;

            var result = await userManager.CreateAsync(user, password);
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(user, role);
            }
        }
    }
}
