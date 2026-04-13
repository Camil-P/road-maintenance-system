using System;
using System.Collections.Generic;
using System.Text;

namespace RoadMaintenance.Domain.Interfaces
{
    public interface IMustHaveTenant
    {
        Guid? AgencyId { get; set; }
    }
}
