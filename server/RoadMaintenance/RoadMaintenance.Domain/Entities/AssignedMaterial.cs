using System;

namespace RoadMaintenance.Domain.Entities;

/// <summary>
/// Represents a material and its quantity assigned to a specific work order.
/// </summary>
public class AssignedMaterial
{
    public Guid Id { get; private set; }
    
    public Guid WorkOrderId { get; private set; }
    public WorkOrder WorkOrder { get; private set; } = null!;
    
    public Guid MaterialStockId { get; private set; }
    public MaterialStock MaterialStock { get; private set; } = null!;
    
    /// <summary>
    /// The amount of material allocated or used for this work order
    /// </summary>
    public decimal Quantity { get; private set; }

    // Private constructor for EF Core
    private AssignedMaterial() { }

    public static AssignedMaterial Create(Guid workOrderId, Guid materialStockId, decimal quantity)
    {
        if (workOrderId == Guid.Empty)
            throw new ArgumentException("Work order ID is required.", nameof(workOrderId));
        
        if (materialStockId == Guid.Empty)
            throw new ArgumentException("Material stock ID is required.", nameof(materialStockId));
        
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero.", nameof(quantity));

        return new AssignedMaterial
        {
            Id = Guid.NewGuid(),
            WorkOrderId = workOrderId,
            MaterialStockId = materialStockId,
            Quantity = quantity
        };
    }

    /// <summary>
    /// Updates the quantity of the assigned material (e.g., if more was used than estimated)
    /// </summary>
    public void UpdateQuantity(decimal newQuantity)
    {
        if (newQuantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero.", nameof(newQuantity));
            
        Quantity = newQuantity;
    }
}