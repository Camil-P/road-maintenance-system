using Microsoft.EntityFrameworkCore;
using RoadMaintenance.Api.Features.Materials.Contracts;
using RoadMaintenance.Infrastructure.Persistence;

namespace RoadMaintenance.Api.Features.Materials;

public interface IMaterialsHandler
{
    Task<IEnumerable<MaterialResponse>> GetAllAsync();
    Task<MaterialResponse?> GetByIdAsync(Guid id);
    Task<(bool Success, MaterialResponse? Response, string? Error)> CreateAsync(CreateMaterialRequest request);
    Task<(bool Success, MaterialResponse? Response, string? Error)> UpdateAsync(Guid id, UpdateMaterialRequest request);
    Task<(bool Success, MaterialResponse? Response, string? Error)> AddStockAsync(Guid id, AdjustMaterialStockRequest request);
    Task<(bool Success, MaterialResponse? Response, string? Error)> ConsumeStockAsync(Guid id, AdjustMaterialStockRequest request);
}

public class MaterialsHandler : IMaterialsHandler
{
    private readonly AppDbContext _context;

    public MaterialsHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<MaterialResponse>> GetAllAsync()
    {
        var items = await _context.MaterialStocks
            .AsNoTracking()
            .OrderBy(m => m.Name)
            .ToListAsync();

        return items.Select(MapToResponse);
    }

    public async Task<MaterialResponse?> GetByIdAsync(Guid id)
    {
        var item = await _context.MaterialStocks
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == id);

        return item is null ? null : MapToResponse(item);
    }

    public async Task<(bool Success, MaterialResponse? Response, string? Error)> CreateAsync(CreateMaterialRequest request)
    {
        try
        {
            var material = Domain.Entities.MaterialStock.Create(
                name: request.Name.Trim(),
                unit: request.Unit.Trim(),
                currentQuantity: request.CurrentQuantity,
                minimumThreshold: request.MinimumThreshold,
                unitCost: request.UnitCost);

            _context.MaterialStocks.Add(material);
            await _context.SaveChangesAsync();

            return (true, MapToResponse(material), null);
        }
        catch (Exception ex)
        {
            return (false, null, ex.Message);
        }
    }

    public async Task<(bool Success, MaterialResponse? Response, string? Error)> UpdateAsync(Guid id, UpdateMaterialRequest request)
    {
        var material = await _context.MaterialStocks.FirstOrDefaultAsync(m => m.Id == id);
        if (material is null)
        {
            return (false, null, "Material not found.");
        }

        try
        {
            material.UpdateDetails(request.Name.Trim(), request.Unit.Trim(), request.MinimumThreshold, request.UnitCost);
            await _context.SaveChangesAsync();

            return (true, MapToResponse(material), null);
        }
        catch (Exception ex)
        {
            return (false, null, ex.Message);
        }
    }

    public async Task<(bool Success, MaterialResponse? Response, string? Error)> AddStockAsync(Guid id, AdjustMaterialStockRequest request)
    {
        var material = await _context.MaterialStocks.FirstOrDefaultAsync(m => m.Id == id);
        if (material is null)
        {
            return (false, null, "Material not found.");
        }

        try
        {
            material.AddStock(request.Quantity);
            await _context.SaveChangesAsync();

            return (true, MapToResponse(material), null);
        }
        catch (Exception ex)
        {
            return (false, null, ex.Message);
        }
    }

    public async Task<(bool Success, MaterialResponse? Response, string? Error)> ConsumeStockAsync(Guid id, AdjustMaterialStockRequest request)
    {
        var material = await _context.MaterialStocks.FirstOrDefaultAsync(m => m.Id == id);
        if (material is null)
        {
            return (false, null, "Material not found.");
        }

        try
        {
            material.ConsumeStock(request.Quantity);

            if (request.WorkOrderId.HasValue)
            {
                var workOrder = await _context.WorkOrders.FirstOrDefaultAsync(w => w.Id == request.WorkOrderId.Value);
                if (workOrder is null)
                {
                    return (false, null, "Work order not found.");
                }

                workOrder.AddActualCost(request.Quantity * material.UnitCost);
            }

            await _context.SaveChangesAsync();
            return (true, MapToResponse(material), null);
        }
        catch (Exception ex)
        {
            return (false, null, ex.Message);
        }
    }

    private static MaterialResponse MapToResponse(Domain.Entities.MaterialStock material)
    {
        return new MaterialResponse
        {
            Id = material.Id,
            Name = material.Name,
            Unit = material.Unit,
            CurrentQuantity = material.CurrentQuantity,
            MinimumThreshold = material.MinimumThreshold,
            UnitCost = material.UnitCost,
            TotalValue = material.TotalValue,
            IsBelowThreshold = material.IsBelowThreshold,
            LastUpdated = material.LastUpdated
        };
    }
}
