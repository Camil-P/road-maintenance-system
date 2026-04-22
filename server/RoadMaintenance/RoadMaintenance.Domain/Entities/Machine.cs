using RoadMaintenance.Domain.Interfaces;

namespace RoadMaintenance.Domain.Entities;

/// <summary>
/// Represents a machine or vehicle used for road maintenance.
/// Includes a simple amortization model for cost tracking.
/// </summary>
public class Machine : IMustHaveTenant
{
    public Guid Id { get; private set; }
    
    /// <summary>
    /// Name or identifier for the machine (e.g., "Truck #12", "Roller A")
    /// </summary>
    public string Name { get; private set; } = string.Empty;
    
    /// <summary>
    /// Type of machine (e.g., "Truck", "Roller", "Paver", "Snow Plow")
    /// </summary>
    public string MachineType { get; private set; } = string.Empty;
    
    /// <summary>
    /// Registration number or license plate (if applicable)
    /// </summary>
    public string? RegistrationNumber { get; private set; }
    
    /// <summary>
    /// Year the machine was acquired
    /// </summary>
    public int AcquisitionYear { get; private set; }
    
    /// <summary>
    /// Original purchase price
    /// </summary>
    public decimal PurchasePrice { get; private set; }
    
    /// <summary>
    /// Expected useful life in years (for depreciation calculation)
    /// </summary>
    public int UsefulLifeYears { get; private set; }
    
    /// <summary>
    /// Expected residual value at end of useful life
    /// </summary>
    public decimal ResidualValue { get; private set; }
    
    /// <summary>
    /// Whether the machine is currently operational
    /// </summary>
    public bool IsOperational { get; private set; }
    
    /// <summary>
    /// Date of last maintenance/service
    /// </summary>
    public DateTime? LastMaintenanceDate { get; private set; }
    
    /// <summary>
    /// Notes about the machine's condition or maintenance history
    /// </summary>
    public string? Notes { get; private set; }
    
    /// <summary>
    /// ID of the agency that this machine belongs to.
    /// </summary>
    public Guid AgencyId { get; set; }
    public Agency Agency { get; set; } = null!;

    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    
    // Private constructor for EF Core
    private Machine() { }
    
    public static Machine Create(
        string name,
        string machineType,
        int acquisitionYear,
        decimal purchasePrice,
        int usefulLifeYears,
        decimal residualValue = 0,
        string? registrationNumber = null,
        string? notes = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Machine name is required.", nameof(name));
        
        if (string.IsNullOrWhiteSpace(machineType))
            throw new ArgumentException("Machine type is required.", nameof(machineType));
        
        if (acquisitionYear < 1900 || acquisitionYear > DateTime.UtcNow.Year + 1)
            throw new ArgumentOutOfRangeException(nameof(acquisitionYear), "Invalid acquisition year.");
        
        if (purchasePrice < 0)
            throw new ArgumentException("Purchase price cannot be negative.", nameof(purchasePrice));
        
        if (usefulLifeYears <= 0)
            throw new ArgumentException("Useful life must be at least 1 year.", nameof(usefulLifeYears));
        
        if (residualValue < 0)
            throw new ArgumentException("Residual value cannot be negative.", nameof(residualValue));
        
        if (residualValue > purchasePrice)
            throw new ArgumentException("Residual value cannot exceed purchase price.", nameof(residualValue));
        
        return new Machine
        {
            Id = Guid.NewGuid(),
            Name = name,
            MachineType = machineType,
            RegistrationNumber = registrationNumber,
            AcquisitionYear = acquisitionYear,
            PurchasePrice = purchasePrice,
            UsefulLifeYears = usefulLifeYears,
            ResidualValue = residualValue,
            IsOperational = true,
            Notes = notes,
            CreatedAt = DateTime.UtcNow
        };
    }
    
    /// <summary>
    /// Calculates the annual depreciation using straight-line method.
    /// </summary>
    public decimal AnnualDepreciation => (PurchasePrice - ResidualValue) / UsefulLifeYears;
    
    /// <summary>
    /// Calculates the current book value based on years since acquisition.
    /// </summary>
    public decimal CurrentBookValue
    {
        get
        {
            var yearsOwned = DateTime.UtcNow.Year - AcquisitionYear;
            var totalDepreciation = AnnualDepreciation * Math.Min(yearsOwned, UsefulLifeYears);
            return Math.Max(PurchasePrice - totalDepreciation, ResidualValue);
        }
    }
    
    /// <summary>
    /// Records a maintenance event.
    /// </summary>
    public void RecordMaintenance(string? notes = null)
    {
        LastMaintenanceDate = DateTime.UtcNow;
        if (!string.IsNullOrWhiteSpace(notes))
        {
            Notes = string.IsNullOrEmpty(Notes) 
                ? notes 
                : $"{Notes}\n{DateTime.UtcNow:yyyy-MM-dd}: {notes}";
        }
        UpdatedAt = DateTime.UtcNow;
    }
    
    /// <summary>
    /// Marks the machine as non-operational.
    /// </summary>
    public void MarkAsNonOperational(string? reason = null)
    {
        IsOperational = false;
        if (!string.IsNullOrWhiteSpace(reason))
        {
            Notes = string.IsNullOrEmpty(Notes)
                ? $"Non-operational: {reason}"
                : $"{Notes}\n{DateTime.UtcNow:yyyy-MM-dd}: Non-operational - {reason}";
        }
        UpdatedAt = DateTime.UtcNow;
    }
    
    /// <summary>
    /// Marks the machine as operational again.
    /// </summary>
    public void MarkAsOperational()
    {
        IsOperational = true;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Updates editable machine metadata.
    /// </summary>
    public void UpdateDetails(
        string name,
        string machineType,
        int acquisitionYear,
        decimal purchasePrice,
        int usefulLifeYears,
        decimal residualValue,
        string? registrationNumber,
        string? notes)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Machine name is required.", nameof(name));

        if (string.IsNullOrWhiteSpace(machineType))
            throw new ArgumentException("Machine type is required.", nameof(machineType));

        if (acquisitionYear < 1900 || acquisitionYear > DateTime.UtcNow.Year + 1)
            throw new ArgumentOutOfRangeException(nameof(acquisitionYear), "Invalid acquisition year.");

        if (purchasePrice < 0)
            throw new ArgumentException("Purchase price cannot be negative.", nameof(purchasePrice));

        if (usefulLifeYears <= 0)
            throw new ArgumentException("Useful life must be at least 1 year.", nameof(usefulLifeYears));

        if (residualValue < 0)
            throw new ArgumentException("Residual value cannot be negative.", nameof(residualValue));

        if (residualValue > purchasePrice)
            throw new ArgumentException("Residual value cannot exceed purchase price.", nameof(residualValue));

        Name = name;
        MachineType = machineType;
        AcquisitionYear = acquisitionYear;
        PurchasePrice = purchasePrice;
        UsefulLifeYears = usefulLifeYears;
        ResidualValue = residualValue;
        RegistrationNumber = registrationNumber;
        Notes = notes;
        UpdatedAt = DateTime.UtcNow;
    }
}
