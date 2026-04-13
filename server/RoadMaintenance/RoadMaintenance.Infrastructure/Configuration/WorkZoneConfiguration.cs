using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoadMaintenance.Domain.Entities;

namespace RoadMaintenance.Infrastructure.Configuration;

public class WorkZoneConfiguration : IEntityTypeConfiguration<WorkZone>
{
    public void Configure(EntityTypeBuilder<WorkZone> builder)
    {
        builder.HasKey(w => w.Id);

        builder.Property(w => w.Name).IsRequired().HasMaxLength(300);
        builder.Property(w => w.GeometryJson).IsRequired().HasColumnType("jsonb");
        builder.Property(w => w.OriginalGeometryJson).IsRequired().HasColumnType("jsonb");
        builder.Property(w => w.CreatedByUserId).IsRequired().HasMaxLength(450);
        builder.Property(w => w.Status).IsRequired();
        builder.Property(w => w.AffectedLane).IsRequired();

        builder.HasMany(w => w.History)
            .WithOne(h => h.WorkZone)
            .HasForeignKey(h => h.WorkZoneId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(w => w.Status);
    }
}

public class WorkZoneHistoryConfiguration : IEntityTypeConfiguration<WorkZoneHistory>
{
    public void Configure(EntityTypeBuilder<WorkZoneHistory> builder)
    {
        builder.HasKey(h => h.Id);

        builder.Property(h => h.GeometryJson).IsRequired().HasColumnType("jsonb");
        builder.Property(h => h.Note).HasMaxLength(2000);

        builder.HasIndex(h => h.WorkZoneId);
        builder.HasIndex(h => h.CreatedAt);
    }
}
