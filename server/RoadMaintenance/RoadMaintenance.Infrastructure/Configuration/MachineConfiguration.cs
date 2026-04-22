using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoadMaintenance.Domain.Entities;

namespace RoadMaintenance.Infrastructure.Configuration;

public class MachineConfiguration : IEntityTypeConfiguration<Machine>
{
    public void Configure(EntityTypeBuilder<Machine> builder)
    {
        builder.HasKey(m => m.Id);

        builder.Property(m => m.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(m => m.MachineType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(m => m.RegistrationNumber)
            .HasMaxLength(50);

        builder.Property(m => m.Notes)
            .HasMaxLength(4000);

        builder.Property(m => m.PurchasePrice)
            .HasPrecision(18, 2);

        builder.Property(m => m.ResidualValue)
            .HasPrecision(18, 2);

        builder.HasOne(m => m.Agency)
            .WithMany()
            .HasForeignKey(m => m.AgencyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(m => m.Name);
        builder.HasIndex(m => m.MachineType);
        builder.HasIndex(m => m.IsOperational);
        builder.HasIndex(m => m.RegistrationNumber)
            .IsUnique()
            .HasFilter("\"RegistrationNumber\" IS NOT NULL"); // Updated filter syntax
    }
}
