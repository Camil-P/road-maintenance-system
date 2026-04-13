using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoadMaintenance.Domain.Entities;

namespace RoadMaintenance.Infrastructure.Configuration;

public class RoadSegmentConfiguration : IEntityTypeConfiguration<RoadSegment>
{
    public void Configure(EntityTypeBuilder<RoadSegment> builder)
    {
        builder.HasKey(r => r.Id);
        
        builder.Property(r => r.Name)
            .IsRequired()
            .HasMaxLength(200);
        
        builder.Property(r => r.Description)
            .HasMaxLength(2000);
        
        builder.Property(r => r.LengthKm)
            .HasPrecision(10, 2);
        
        builder.Property(r => r.Category)
            .IsRequired();
        
        builder.Property(r => r.Status)
            .IsRequired();
        
        builder.Property(r => r.GeometryJson)
            .HasColumnType("jsonb");

        builder.HasIndex(r => r.Name);
        builder.HasIndex(r => r.Category);
        builder.HasIndex(r => r.Status);
    }
}
