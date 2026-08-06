using RoadMaintenance.Infrastructure.Interfaces;
using System.Security.Claims;

namespace RoadMaintenance.Api.Common
{
    public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;

        public Guid? UserId
        {
            get
            {
                var userIdString = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
                return Guid.TryParse(userIdString, out var userId) ? userId : null;
            }
        }

        public Guid? AgencyId
        {
            get
            {
                // Očekujemo da si u AuthService-u dodao Claim sa imenom "AgencyId"
                var agencyIdString = _httpContextAccessor.HttpContext?.User?.FindFirstValue("AgencyId");
                return Guid.TryParse(agencyIdString, out var agencyId) ? agencyId : null;
            }
        }

        public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;
    }
}
