using RoadMaintenance.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace RoadMaintenance.Api.Features.Incidents.Contracts.Validations;

public class ValidIncidentTypeAttribute : ValidationAttribute
{
    public override bool IsValid(object? value)
    {
        if (value == null) return false;
        return Enum.IsDefined(typeof(IncidentType), value);
    }
}