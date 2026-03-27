using System.ComponentModel.DataAnnotations;

namespace RoadMaintenance.Api.Auth.Contracts;

/// <summary>
/// Request model for user registration.
/// </summary>
public class RegisterRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters long.")]
    public string Password { get; set; } = string.Empty;
    
    [Required]
    [Compare(nameof(Password), ErrorMessage = "Passwords do not match.")]
    public string ConfirmPassword { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;
}

/// <summary>
/// Request model for admin-created user accounts.
/// </summary>
public class AdminRegisterRequest : RegisterRequest
{
    [Required]
    [RegularExpression("^(FieldWorker|Dispatcher|MaintenanceManager)$",
        ErrorMessage = "Role must be FieldWorker, Dispatcher, or MaintenanceManager.")]
    public string Role { get; set; } = string.Empty;
}

/// <summary>
/// Request model for user login.
/// </summary>
public class LoginRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    public string Password { get; set; } = string.Empty;
}

/// <summary>
/// Query DTP for the list of users
/// </summary>
public class UserQueryParameters
{
    public string? SearchTerm { get; set; }
    public string? Role { get; set; }
    public bool? IsActive { get; set; }
}

/// <summary>
/// Response model for the list of users
/// </summary>
public class UserResponse
{
    public string UserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public IEnumerable<string> Roles { get; set; } = [];
}

/// <summary>
/// Response model for successful authentication.
/// </summary>
public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public DateTime Expiration { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public IEnumerable<string> Roles { get; set; } = [];
}

public class AssignRoleRequest
{
    [Required]
    [RegularExpression("^(Driver|FieldWorker|Dispatcher|MaintenanceManager)$",
        ErrorMessage = "Role must be Driver, FieldWorker, Dispatcher, or MaintenanceManager.")]
    public string Role { get; set; } = string.Empty;
}

public class SetUserActiveRequest
{
    public bool IsActive { get; set; }
}

public class UpdateProfileRequest
{
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;
}