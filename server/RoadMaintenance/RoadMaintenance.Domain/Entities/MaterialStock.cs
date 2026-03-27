namespace RoadMaintenance.Domain.Entities;

/// <summary>
/// Represents the current stock levels of maintenance materials.
/// </summary>
public class MaterialStock
{
    public Guid Id { get; private set; }
    
    /// <summary>
    /// Name of the material
    /// </summary>
    public string Name { get; private set; } = string.Empty;
    
    /// <summary>
    /// Unit of measurement (e.g., "tons", "liters", "kg", "pieces")
    /// </summary>
    public string Unit { get; private set; } = string.Empty;
    
    /// <summary>
    /// Current quantity in stock
    /// </summary>
    public decimal CurrentQuantity { get; private set; }
    
    /// <summary>
    /// Minimum quantity threshold for alerts
    /// </summary>
    public decimal MinimumThreshold { get; private set; }
    
    /// <summary>
    /// Cost per unit of material
    /// </summary>
    public decimal UnitCost { get; private set; }
    
    public DateTime LastUpdated { get; private set; }
    
    // Private constructor for EF Core
    private MaterialStock() { }
    
    public static MaterialStock Create(
        string name,
        string unit,
        decimal currentQuantity,
        decimal minimumThreshold,
        decimal unitCost)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Material name is required.", nameof(name));
        
        if (string.IsNullOrWhiteSpace(unit))
            throw new ArgumentException("Unit of measurement is required.", nameof(unit));
        
        if (currentQuantity < 0)
            throw new ArgumentException("Current quantity cannot be negative.", nameof(currentQuantity));
        
        if (minimumThreshold < 0)
            throw new ArgumentException("Minimum threshold cannot be negative.", nameof(minimumThreshold));
        
        if (unitCost < 0)
            throw new ArgumentException("Unit cost cannot be negative.", nameof(unitCost));
        
        return new MaterialStock
        {
            Id = Guid.NewGuid(),
            Name = name,
            Unit = unit,
            CurrentQuantity = currentQuantity,
            MinimumThreshold = minimumThreshold,
            UnitCost = unitCost,
            LastUpdated = DateTime.UtcNow
        };
    }
    
    /// <summary>
    /// Adds quantity to the stock (e.g., after a delivery).
    /// </summary>
    public void AddStock(decimal quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity to add must be positive.", nameof(quantity));
        
        CurrentQuantity += quantity;
        LastUpdated = DateTime.UtcNow;
    }
    
    /// <summary>
    /// Removes quantity from the stock (e.g., when used in a work order).
    /// </summary>
    public void ConsumeStock(decimal quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity to consume must be positive.", nameof(quantity));
        
        if (quantity > CurrentQuantity)
            throw new InvalidOperationException($"Insufficient stock. Available: {CurrentQuantity} {Unit}, Requested: {quantity} {Unit}");
        
        CurrentQuantity -= quantity;
        LastUpdated = DateTime.UtcNow;
    }
    
    /// <summary>
    /// Updates the unit cost.
    /// </summary>
    public void UpdateUnitCost(decimal newUnitCost)
    {
        if (newUnitCost < 0)
            throw new ArgumentException("Unit cost cannot be negative.", nameof(newUnitCost));
        
        UnitCost = newUnitCost;
        LastUpdated = DateTime.UtcNow;
    }

    /// <summary>
    /// Updates editable material metadata.
    /// </summary>
    public void UpdateDetails(string name, string unit, decimal minimumThreshold, decimal unitCost)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Material name is required.", nameof(name));

        if (string.IsNullOrWhiteSpace(unit))
            throw new ArgumentException("Unit of measurement is required.", nameof(unit));

        if (minimumThreshold < 0)
            throw new ArgumentException("Minimum threshold cannot be negative.", nameof(minimumThreshold));

        if (unitCost < 0)
            throw new ArgumentException("Unit cost cannot be negative.", nameof(unitCost));

        Name = name;
        Unit = unit;
        MinimumThreshold = minimumThreshold;
        UnitCost = unitCost;
        LastUpdated = DateTime.UtcNow;
    }
    
    /// <summary>
    /// Checks if the current stock is below the minimum threshold.
    /// </summary>
    public bool IsBelowThreshold => CurrentQuantity < MinimumThreshold;
    
    /// <summary>
    /// Calculates the total value of current stock.
    /// </summary>
    public decimal TotalValue => CurrentQuantity * UnitCost;
}
