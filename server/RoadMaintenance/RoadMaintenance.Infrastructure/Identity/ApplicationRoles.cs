namespace RoadMaintenance.Infrastructure.Identity;

/// <summary>
/// Constants for application roles.
/// </summary>
public static class ApplicationRoles
{
    public const string Driver = "Driver";
    public const string FieldWorker = "FieldWorker";
    public const string Dispatcher = "Dispatcher";
    public const string MaintenanceManager = "MaintenanceManager";
    public const string Admin = "Admin"; 

    /// <summary>
    /// Gets all role names for seeding.
    /// </summary>
    public static IReadOnlyList<string> AllRoles =>
    [
        Driver,
        FieldWorker,
        Dispatcher,
        MaintenanceManager,
        Admin,
    ];
}
