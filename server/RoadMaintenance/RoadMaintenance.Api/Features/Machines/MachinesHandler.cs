using Microsoft.EntityFrameworkCore;
using RoadMaintenance.Api.Features.Machines.Contracts;
using RoadMaintenance.Infrastructure.Persistence;

namespace RoadMaintenance.Api.Features.Machines;

public interface IMachinesHandler
{
    Task<IEnumerable<MachineResponse>> GetAllAsync();
    Task<MachineResponse?> GetByIdAsync(Guid id);
    Task<(bool Success, MachineResponse? Response, string? Error)> CreateAsync(CreateMachineRequest request);
    Task<(bool Success, MachineResponse? Response, string? Error)> UpdateAsync(Guid id, UpdateMachineRequest request);
    Task<(bool Success, MachineResponse? Response, string? Error)> SetOperationalStatusAsync(Guid id, SetMachineOperationalRequest request);
    Task<(bool Success, MachineResponse? Response, string? Error)> RecordMaintenanceAsync(Guid id, RecordMaintenanceRequest request);
}

public class MachinesHandler : IMachinesHandler
{
    private readonly AppDbContext _context;

    public MachinesHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<MachineResponse>> GetAllAsync()
    {
        var items = await _context.Machines
            .AsNoTracking()
            .OrderBy(m => m.Name)
            .ToListAsync();

        return items.Select(MapToResponse);
    }

    public async Task<MachineResponse?> GetByIdAsync(Guid id)
    {
        var item = await _context.Machines.AsNoTracking().FirstOrDefaultAsync(m => m.Id == id);
        return item is null ? null : MapToResponse(item);
    }

    public async Task<(bool Success, MachineResponse? Response, string? Error)> CreateAsync(CreateMachineRequest request)
    {
        try
        {
            var machine = Domain.Entities.Machine.Create(
                name: request.Name.Trim(),
                machineType: request.MachineType.Trim(),
                acquisitionYear: request.AcquisitionYear,
                purchasePrice: request.PurchasePrice,
                usefulLifeYears: request.UsefulLifeYears,
                residualValue: request.ResidualValue,
                registrationNumber: request.RegistrationNumber,
                notes: request.Notes);

            _context.Machines.Add(machine);
            await _context.SaveChangesAsync();

            return (true, MapToResponse(machine), null);
        }
        catch (Exception ex)
        {
            return (false, null, ex.Message);
        }
    }

    public async Task<(bool Success, MachineResponse? Response, string? Error)> UpdateAsync(Guid id, UpdateMachineRequest request)
    {
        var machine = await _context.Machines.FirstOrDefaultAsync(m => m.Id == id);
        if (machine is null)
        {
            return (false, null, "Machine not found.");
        }

        try
        {
            machine.UpdateDetails(
                name: request.Name.Trim(),
                machineType: request.MachineType.Trim(),
                acquisitionYear: request.AcquisitionYear,
                purchasePrice: request.PurchasePrice,
                usefulLifeYears: request.UsefulLifeYears,
                residualValue: request.ResidualValue,
                registrationNumber: request.RegistrationNumber,
                notes: request.Notes);

            await _context.SaveChangesAsync();
            return (true, MapToResponse(machine), null);
        }
        catch (Exception ex)
        {
            return (false, null, ex.Message);
        }
    }

    public async Task<(bool Success, MachineResponse? Response, string? Error)> SetOperationalStatusAsync(Guid id, SetMachineOperationalRequest request)
    {
        var machine = await _context.Machines.FirstOrDefaultAsync(m => m.Id == id);
        if (machine is null)
        {
            return (false, null, "Machine not found.");
        }

        if (request.IsOperational)
        {
            machine.MarkAsOperational();
        }
        else
        {
            machine.MarkAsNonOperational(request.Reason);
        }

        await _context.SaveChangesAsync();
        return (true, MapToResponse(machine), null);
    }

    public async Task<(bool Success, MachineResponse? Response, string? Error)> RecordMaintenanceAsync(Guid id, RecordMaintenanceRequest request)
    {
        var machine = await _context.Machines.FirstOrDefaultAsync(m => m.Id == id);
        if (machine is null)
        {
            return (false, null, "Machine not found.");
        }

        machine.RecordMaintenance(request.Notes);
        await _context.SaveChangesAsync();

        return (true, MapToResponse(machine), null);
    }

    private static MachineResponse MapToResponse(Domain.Entities.Machine machine)
    {
        return new MachineResponse
        {
            Id = machine.Id,
            Name = machine.Name,
            MachineType = machine.MachineType,
            RegistrationNumber = machine.RegistrationNumber,
            AcquisitionYear = machine.AcquisitionYear,
            PurchasePrice = machine.PurchasePrice,
            UsefulLifeYears = machine.UsefulLifeYears,
            ResidualValue = machine.ResidualValue,
            IsOperational = machine.IsOperational,
            LastMaintenanceDate = machine.LastMaintenanceDate,
            Notes = machine.Notes,
            AnnualDepreciation = machine.AnnualDepreciation,
            CurrentBookValue = machine.CurrentBookValue
        };
    }
}
