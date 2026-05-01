using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoadMaintenance.Domain.Entities;

namespace RoadMaintenance.Infrastructure.Configuration;

public class AssignedMaterialConfiguration : IEntityTypeConfiguration<AssignedMaterial>
{
    public void Configure(EntityTypeBuilder<AssignedMaterial> builder)
    {
        builder.HasKey(am => am.Id);

        builder.Property(am => am.Quantity)
            .IsRequired()
            .HasPrecision(18, 4); // Matched precision with MaterialStock

        // Relationship mapping
        builder.HasOne(am => am.MaterialStock)
            .WithMany()
            .HasForeignKey(am => am.MaterialStockId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent deleting a stock item if it has history in work orders

        builder.HasOne(am => am.WorkOrder)
            .WithMany(wo => wo.AssignedMaterials)
            .HasForeignKey(am => am.WorkOrderId)
            .OnDelete(DeleteBehavior.Cascade); // Deleting a work order deletes its material assignments
    }
}