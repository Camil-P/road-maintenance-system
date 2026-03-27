using Microsoft.AspNetCore.Identity;

namespace RoadMaintenance.Infrastructure.Identity;

/// <summary>
/// Application user entity extending ASP.NET Core Identity.
/// Contains additional profile information beyond the standard IdentityUser.
/// </summary>
public class ApplicationUser : IdentityUser
{
    /// <summary>
    /// User's first name
    /// </summary>
    public string FirstName { get; set; } = string.Empty;
    
    /// <summary>
    /// User's last name
    /// </summary>
    public string LastName { get; set; } = string.Empty;
    
    /// <summary>
    /// Date and time when the user registered
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// Whether the user account is active
    /// </summary>
    public bool IsActive { get; set; } = true;
    
    /// <summary>
    /// Gets the full name of the user
    /// </summary>
    public string FullName => $"{FirstName} {LastName}".Trim();
}
