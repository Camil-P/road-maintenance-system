using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoadMaintenance.Domain.Entities;

namespace RoadMaintenance.Infrastructure.Configuration;

public class MaterialStockConfiguration : IEntityTypeConfiguration<MaterialStock>
{
    public void Configure(EntityTypeBuilder<MaterialStock> builder)
    {
        builder.HasKey(m => m.Id);
        
        builder.Property(m => m.Name)
            .IsRequired()
            .HasMaxLength(200);
        
        builder.Property(m => m.Unit)
            .IsRequired()
            .HasMaxLength(50);
        
        builder.Property(m => m.CurrentQuantity)
            .HasPrecision(18, 4);
        
        builder.Property(m => m.MinimumThreshold)
            .HasPrecision(18, 4);
        
        builder.Property(m => m.UnitCost)
            .HasPrecision(18, 2);
        
        builder.HasIndex(m => m.Name)
            .IsUnique();

        builder.HasOne(m => m.Agency)
            .WithMany()
            .HasForeignKey(m => m.AgencyId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
