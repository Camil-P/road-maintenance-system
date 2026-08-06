using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoadMaintenance.Domain.Entities;

namespace RoadMaintenance.Infrastructure.Configuration;

public class WorkOrderConfiguration : IEntityTypeConfiguration<WorkOrder>
{
    public void Configure(EntityTypeBuilder<WorkOrder> builder)
    {
        builder.HasKey(w => w.Id);

        builder.Property(w => w.Description)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(w => w.CompletionNotes)
            .HasMaxLength(2000);

        builder.Property(w => w.EstimatedCost)
            .HasPrecision(18, 2);

        builder.Property(w => w.ActualCost)
            .HasPrecision(18, 2);

        // Map Lists of Guids to primitive collections (Requires EF Core 8+)
        builder.Property(w => w.AssignedWorkerIds)
            .HasColumnName("AssignedWorkerIds"); // EF Core 8 natively maps this to JSON or arrays depending on the DB provider

        builder.Property(w => w.AssignedMachineIds)
            .HasColumnName("AssignedMachineIds");

        // Relationships
        builder.HasOne(w => w.Agency)
            .WithMany()
            .HasForeignKey(w => w.AgencyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(w => w.RoadSegment)
            .WithMany()
            .HasForeignKey(w => w.RoadSegmentId)
            .OnDelete(DeleteBehavior.SetNull);

        // The navigation for AssignedMaterials is mapped automatically via the AssignedMaterialConfiguration,
        // but we need to tell EF Core about the backing field since we used encapsulation.
        builder.Metadata.FindNavigation(nameof(WorkOrder.AssignedMaterials))!
            .SetPropertyAccessMode(PropertyAccessMode.Field);
    }
}