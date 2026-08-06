using System;
using System.Collections.Generic;
using System.Text;

namespace RoadMaintenance.Domain.Interfaces
{
    public interface IMayHaveTenant
    {
        Guid? AgencyId { get; set; }
    }
}
