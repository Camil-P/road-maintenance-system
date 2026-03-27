using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoadMaintenance.Domain.Entities;

namespace RoadMaintenance.Infrastructure.Configuration;

public class InfrastructureAssetConfiguration : IEntityTypeConfiguration<InfrastructureAsset>
{
    public void Configure(EntityTypeBuilder<InfrastructureAsset> builder)
    {
        builder.HasKey(a => a.Id);
        
        builder.Property(a => a.Name)
            .IsRequired()
            .HasMaxLength(200);
        
        builder.Property(a => a.LocationDescription)
            .HasMaxLength(1000);
        
        builder.Property(a => a.ContractorName)
            .HasMaxLength(200);
        
        builder.Property(a => a.Type)
            .IsRequired();
        
        builder.Property(a => a.Latitude)
            .IsRequired();
        
        builder.Property(a => a.Longitude)
            .IsRequired();
        
        // Relationship with RoadSegment
        builder.HasOne(a => a.RoadSegment)
            .WithMany(r => r.Assets)
            .HasForeignKey(a => a.RoadSegmentId)
            .OnDelete(DeleteBehavior.SetNull);
        
        builder.HasIndex(a => a.Type);
        builder.HasIndex(a => a.RoadSegmentId);
    }
}
