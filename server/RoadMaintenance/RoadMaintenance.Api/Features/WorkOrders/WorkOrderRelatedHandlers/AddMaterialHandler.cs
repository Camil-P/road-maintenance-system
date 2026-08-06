// Features/WorkOrders/AddMaterialHandler.cs
using Microsoft.EntityFrameworkCore;
using RoadMaintenance.Infrastructure.Persistence;

namespace RoadMaintenance.Api.Features.WorkOrders;

public interface IAddMaterialHandler
{
    Task<(bool Success, string? Error)> HandleAsync(Guid workOrderId, Guid materialStockId, decimal quantity);
}

public class AddMaterialHandler : IAddMaterialHandler
{
    private readonly AppDbContext _context;

    public AddMaterialHandler(AppDbContext context) => _context = context;

    public async Task<(bool Success, string? Error)> HandleAsync(Guid workOrderId, Guid materialStockId, decimal quantity)
    {
        // 1. Fetch Work Order WITH the materials collection included
        var workOrder = await _context.WorkOrders
            .Include(w => w.AssignedMaterials)
            .FirstOrDefaultAsync(w => w.Id == workOrderId);

        if (workOrder is null) return (false, "Work order not found.");

        // 2. Fetch the material stock to ensure it exists and has enough quantity
        var stock = await _context.MaterialStocks.FirstOrDefaultAsync(m => m.Id == materialStockId);
        if (stock is null) return (false, "Material stock not found.");

        try
        {
            // 3. Delegate to Domain Entity
            workOrder.AddMaterial(materialStockId, quantity);
            
            // 4. Optionally: Consume the stock immediately or wait until the work order is "Completed"
            // If you consume it immediately:
            // stock.ConsumeStock(quantity);

            await _context.SaveChangesAsync();
            return (true, null);
        }
        catch (Exception ex) when (ex is InvalidOperationException || ex is ArgumentException)
        {
            return (false, ex.Message);
        }
    }
}