using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoadMaintenance.Api.Auth.Contracts;
using RoadMaintenance.Api.Common;
using RoadMaintenance.Infrastructure.Identity;
using System.Security.Claims;

namespace RoadMaintenance.Api.Auth;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    
    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Returns a list of users with optional filtering and searching.
    /// Accessible by Admin and MaintenanceManager.
    /// </summary>
    /// <example>GET /api/auth/users?role=Driver&searchTerm=john</example>
    [HttpGet("users")]
    [Authorize(Roles = $"{ApplicationRoles.Admin},{ApplicationRoles.MaintenanceManager}")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<UserResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAllUsers([FromQuery] UserQueryParameters query)
    {
        var users = await _authService.GetAllUsersAsync(query);
        return Ok(ApiResponse<IEnumerable<UserResponse>>.Ok(users, "Users retrieved successfully."));
    }

    /// <summary>
    /// Registers a new driver account.
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
        {
            var validationErrors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage);
            return BadRequest(ApiResponse.Fail("Validation failed.", validationErrors));
        }
        
        var (success, response, errors) = await _authService.RegisterDriverAsync(request);
        
        if (!success)
        {
            return BadRequest(ApiResponse.Fail("Registration failed.", errors));
        }
        
        return Ok(ApiResponse<AuthResponse>.Ok(response!, "Registration successful."));
    }

    /// <summary>
    /// Admin registers a non-driver account.
    /// </summary>
    [HttpPost("admin/register")]
    [Authorize(Roles = ApplicationRoles.Admin)]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> RegisterStaff([FromBody] AdminRegisterRequest request)
    {
        if (!ModelState.IsValid)
        {
            var validationErrors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage);
            return BadRequest(ApiResponse.Fail("Validation failed.", validationErrors));
        }

        var (success, response, errors) = await _authService.RegisterStaffAsync(request);
        if (!success)
        {
            return BadRequest(ApiResponse.Fail("Registration failed.", errors));
        }

        return Ok(ApiResponse<AuthResponse>.Ok(response!, "Staff user registration successful."));
    }
    
    /// <summary>
    /// Authenticates a user and returns a JWT token.
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage);
            return BadRequest(ApiResponse.Fail("Validation failed.", errors));
        }
        
        var (success, response, error) = await _authService.LoginAsync(request);
        
        if (!success)
        {
            return Unauthorized(ApiResponse.Fail(error!));
        }
        
        return Ok(ApiResponse<AuthResponse>.Ok(response!, "Login successful."));
    }
    
    /// <summary>
    /// Gets the current user's information. Requires authentication.
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult GetCurrentUser()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        var name = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
        var roles = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value);
        
        return Ok(ApiResponse<object>.Ok(new
        {
            UserId = userId,
            Email = email,
            Name = name,
            Roles = roles
        }));
    }

    /// <summary>
    /// Updates first and last name for current user.
    /// </summary>
    [HttpPut("me/profile")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateProfileRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage);
            return BadRequest(ApiResponse.Fail("Validation failed.", errors));
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(ApiResponse.Fail("User not authenticated."));
        }

        var (success, error) = await _authService.UpdateProfileAsync(userId, request);
        if (!success)
        {
            return BadRequest(ApiResponse.Fail(error!));
        }

        return Ok(ApiResponse.Ok("Profile updated successfully."));
    }

    /// <summary>
    /// Admin updates active status for a user.
    /// </summary>
    [HttpPatch("users/{userId}/active")]
    [Authorize(Roles = ApplicationRoles.Admin)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> SetUserActiveStatus(string userId, [FromBody] SetUserActiveRequest request)
    {
        var (success, error) = await _authService.SetUserActiveStatusAsync(userId, request.IsActive);
        if (!success)
        {
            if (error == "User not found.")
            {
                return NotFound(ApiResponse.Fail(error));
            }

            return BadRequest(ApiResponse.Fail(error!));
        }

        return Ok(ApiResponse.Ok("User status updated successfully."));
    }

    /// <summary>
    /// Admin assigns a new role to a user.
    /// </summary>
    [HttpPatch("users/{userId}/role")]
    [Authorize(Roles = ApplicationRoles.Admin)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> AssignRole(string userId, [FromBody] AssignRoleRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage);
            return BadRequest(ApiResponse.Fail("Validation failed.", errors));
        }

        var (success, error) = await _authService.AssignRoleAsync(userId, request.Role);
        if (!success)
        {
            if (error == "User not found.")
            {
                return NotFound(ApiResponse.Fail(error));
            }

            return BadRequest(ApiResponse.Fail(error!));
        }

        return Ok(ApiResponse.Ok("User role updated successfully."));
    }
}
