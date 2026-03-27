using System.ComponentModel.DataAnnotations;

namespace RoadMaintenance.Api.Features.Materials.Contracts;

public class CreateMaterialRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Unit { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public decimal CurrentQuantity { get; set; }

    [Range(0, double.MaxValue)]
    public decimal MinimumThreshold { get; set; }

    [Range(0, double.MaxValue)]
    public decimal UnitCost { get; set; }
}

public class UpdateMaterialRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Unit { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public decimal MinimumThreshold { get; set; }

    [Range(0, double.MaxValue)]
    public decimal UnitCost { get; set; }
}

public class AdjustMaterialStockRequest
{
    [Range(0.0001, double.MaxValue)]
    public decimal Quantity { get; set; }

    public Guid? WorkOrderId { get; set; }
}

public class MaterialResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal CurrentQuantity { get; set; }
    public decimal MinimumThreshold { get; set; }
    public decimal UnitCost { get; set; }
    public decimal TotalValue { get; set; }
    public bool IsBelowThreshold { get; set; }
    public DateTime LastUpdated { get; set; }
}
