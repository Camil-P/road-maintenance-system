using Microsoft.AspNetCore.Identity;

namespace RoadMaintenance.Infrastructure.Identity;

/// <summary>
/// Application user entity extending ASP.NET Core Identity.
/// Contains additional profile information beyond the standard IdentityUser.
/// </summary>
public class ApplicationUser : IdentityUser
{
    /// <summary>
    /// Foreign key to the agency the user belongs to (if applicable).
    /// Nullable because of driver accounts that may not be associated with an agency
    /// </summary>
    public Guid? AgencyId { get; set; }

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
