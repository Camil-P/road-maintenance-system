using System;
using System.Collections.Generic;
using System.Text;

namespace RoadMaintenance.Infrastructure.Interfaces
{
    public interface ICurrentUserService
    {
        Guid? UserId { get; }
        Guid? AgencyId { get; }
        bool IsAuthenticated { get; }
    }
}
