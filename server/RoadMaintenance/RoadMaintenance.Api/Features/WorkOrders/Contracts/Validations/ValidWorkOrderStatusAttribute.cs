using RoadMaintenance.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace RoadMaintenance.Api.Features.WorkOrders.Contracts.Validations
{
    public class ValidWorkOrderStatusAttribute : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            if (value == null) return false;
            return Enum.IsDefined(typeof(WorkOrderStatus), value);
        }
    }
}
