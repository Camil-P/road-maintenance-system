using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using RoadMaintenance.Api.Auth.Contracts;
using RoadMaintenance.Api.Common;
using RoadMaintenance.Infrastructure.Identity;

namespace RoadMaintenance.Api.Auth;

/// <summary>
/// Service for handling authentication operations (register, login, token generation).
/// </summary>
public interface IAuthService
{
    Task<IEnumerable<UserResponse>> GetAllUsersAsync(UserQueryParameters? query = null);
    Task<(bool Success, AuthResponse? Response, IEnumerable<string>? Errors)> RegisterDriverAsync(RegisterRequest request);
    Task<(bool Success, AuthResponse? Response, string? Error)> LoginAsync(LoginRequest request);
    Task<(bool Success, AuthResponse? Response, IEnumerable<string>? Errors)> RegisterStaffAsync(AdminRegisterRequest request);
    Task<(bool Success, string? Error)> SetUserActiveStatusAsync(string userId, bool isActive);
    Task<(bool Success, string? Error)> AssignRoleAsync(string userId, string role);
    Task<(bool Success, string? Error)> UpdateProfileAsync(string userId, UpdateProfileRequest request);
}

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly JwtSettings _jwtSettings;
    
    public AuthService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IOptions<JwtSettings> jwtSettings)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _jwtSettings = jwtSettings.Value;
    }

    public async Task<IEnumerable<UserResponse>> GetAllUsersAsync(UserQueryParameters? query = null)
    {
        var usersQuery = _userManager.Users.AsQueryable();

        // Filtering by Active Status
        if (query?.IsActive.HasValue == true)
        {
            usersQuery = usersQuery.Where(u => u.IsActive == query.IsActive.Value);
        }

        // Searching by Name or Email
        if (!string.IsNullOrWhiteSpace(query?.SearchTerm))
        {
            var term = query.SearchTerm.Trim().ToLower();
            usersQuery = usersQuery.Where(u =>
                u.Email!.ToLower().Contains(term) ||
                u.FirstName.ToLower().Contains(term) ||
                u.LastName.ToLower().Contains(term));
        }

        var users = await usersQuery.ToListAsync();
        var userResponses = new List<UserResponse>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);

            // Filter by Role if specified
            if (!string.IsNullOrWhiteSpace(query?.Role) && !roles.Contains(query.Role))
            {
                continue;
            }

            userResponses.Add(new UserResponse
            {
                UserId = user.Id,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName,
                LastName = user.LastName,
                IsActive = user.IsActive,
                Roles = roles
            });
        }

        return userResponses;
    }

    public async Task<(bool Success, AuthResponse? Response, IEnumerable<string>? Errors)> RegisterDriverAsync(RegisterRequest request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser is not null)
        {
            return (false, null, ["A user with this email already exists."]);
        }
        
        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };
        
        var result = await _userManager.CreateAsync(user, request.Password);
        
        if (!result.Succeeded)
        {
            return (false, null, result.Errors.Select(e => e.Description));
        }
        
        // Assign the Driver role by default
        await _userManager.AddToRoleAsync(user, ApplicationRoles.Driver);
        
        var response = await GenerateAuthResponse(user);
        return (true, response, null);
    }

    public async Task<(bool Success, AuthResponse? Response, IEnumerable<string>? Errors)> RegisterStaffAsync(AdminRegisterRequest request)
    {
        if (!AllowedAdminCreatedRoles.Contains(request.Role))
        {
            return (false, null, ["Unsupported role for admin registration."]);
        }

        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser is not null)
        {
            return (false, null, ["A user with this email already exists."]);
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return (false, null, result.Errors.Select(e => e.Description));
        }

        var addToRoleResult = await _userManager.AddToRoleAsync(user, request.Role);
        if (!addToRoleResult.Succeeded)
        {
            await _userManager.DeleteAsync(user);
            return (false, null, addToRoleResult.Errors.Select(e => e.Description));
        }

        var response = await GenerateAuthResponse(user);
        return (true, response, null);
    }
    
    public async Task<(bool Success, AuthResponse? Response, string? Error)> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            return (false, null, "Invalid email or password.");
        }
        
        if (!user.IsActive)
        {
            return (false, null, "This account has been deactivated.");
        }
        
        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: false);
        
        if (!result.Succeeded)
        {
            return (false, null, "Invalid email or password.");
        }
        
        var response = await GenerateAuthResponse(user);
        return (true, response, null);
    }

    public async Task<(bool Success, string? Error)> SetUserActiveStatusAsync(string userId, bool isActive)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return (false, "User not found.");
        }

        user.IsActive = isActive;
        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            return (false, string.Join("; ", result.Errors.Select(e => e.Description)));
        }

        return (true, null);
    }

    public async Task<(bool Success, string? Error)> AssignRoleAsync(string userId, string role)
    {
        if (!AllowedAssignableRoles.Contains(role))
        {
            return (false, "Unsupported role.");
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return (false, "User not found.");
        }

        var currentRoles = await _userManager.GetRolesAsync(user);
        if (currentRoles.Count > 0)
        {
            var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!removeResult.Succeeded)
            {
                return (false, string.Join("; ", removeResult.Errors.Select(e => e.Description)));
            }
        }

        var addResult = await _userManager.AddToRoleAsync(user, role);
        if (!addResult.Succeeded)
        {
            return (false, string.Join("; ", addResult.Errors.Select(e => e.Description)));
        }

        return (true, null);
    }

    public async Task<(bool Success, string? Error)> UpdateProfileAsync(string userId, UpdateProfileRequest request)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return (false, "User not found.");
        }

        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return (false, string.Join("; ", result.Errors.Select(e => e.Description)));
        }

        return (true, null);
    }

    private static readonly HashSet<string> AllowedAdminCreatedRoles =
    [
        ApplicationRoles.FieldWorker,
        ApplicationRoles.Dispatcher,
        ApplicationRoles.MaintenanceManager
    ];

    private static readonly HashSet<string> AllowedAssignableRoles =
    [
        ApplicationRoles.Driver,
        ApplicationRoles.FieldWorker,
        ApplicationRoles.Dispatcher,
        ApplicationRoles.MaintenanceManager
    ];
    
    private async Task<AuthResponse> GenerateAuthResponse(ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var token = GenerateJwtToken(user, roles);
        var expiration = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes);
        
        return new AuthResponse
        {
            Token = token,
            Expiration = expiration,
            UserId = user.Id,
            Email = user.Email!,
            FullName = user.FullName,
            Roles = roles,
            AgencyId = user.AgencyId.ToString() ?? string.Empty
        };
    }
    
    private string GenerateJwtToken(ApplicationUser user, IList<string> roles)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email!),
            new(ClaimTypes.Name, user.FullName),
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new("AgencyId", user.AgencyId.ToString() ?? string.Empty)
        };
        
        // Add role claims
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }
        
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiration = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes);
        
        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: expiration,
            signingCredentials: credentials);
        
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
