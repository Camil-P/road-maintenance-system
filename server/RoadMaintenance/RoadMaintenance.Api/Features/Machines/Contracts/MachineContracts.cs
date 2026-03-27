using System.ComponentModel.DataAnnotations;

namespace RoadMaintenance.Api.Features.Machines.Contracts;

public class CreateMachineRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string MachineType { get; set; } = string.Empty;

    [Range(1900, 3000)]
    public int AcquisitionYear { get; set; }

    [Range(0, double.MaxValue)]
    public decimal PurchasePrice { get; set; }

    [Range(1, int.MaxValue)]
    public int UsefulLifeYears { get; set; }

    [Range(0, double.MaxValue)]
    public decimal ResidualValue { get; set; }

    [MaxLength(50)]
    public string? RegistrationNumber { get; set; }

    [MaxLength(4000)]
    public string? Notes { get; set; }
}

public class UpdateMachineRequest : CreateMachineRequest;

public class RecordMaintenanceRequest
{
    [MaxLength(1000)]
    public string? Notes { get; set; }
}

public class SetMachineOperationalRequest
{
    public bool IsOperational { get; set; }

    [MaxLength(1000)]
    public string? Reason { get; set; }
}

public class MachineResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string MachineType { get; set; } = string.Empty;
    public string? RegistrationNumber { get; set; }
    public int AcquisitionYear { get; set; }
    public decimal PurchasePrice { get; set; }
    public int UsefulLifeYears { get; set; }
    public decimal ResidualValue { get; set; }
    public bool IsOperational { get; set; }
    public DateTime? LastMaintenanceDate { get; set; }
    public string? Notes { get; set; }
    public decimal AnnualDepreciation { get; set; }
    public decimal CurrentBookValue { get; set; }
}
