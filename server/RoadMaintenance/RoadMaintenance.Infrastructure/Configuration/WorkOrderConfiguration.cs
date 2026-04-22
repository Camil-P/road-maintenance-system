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
        
        builder.Property(w => w.CreatedByUserId)
            .IsRequired()
            .HasMaxLength(450);
        
        builder.Property(w => w.AssignedToUserId)
            .HasMaxLength(450);
        
        builder.Property(w => w.WorkType)
            .IsRequired();
        
        builder.Property(w => w.Status)
            .IsRequired();
        
        builder.Property(w => w.Priority)
            .IsRequired();
        
        builder.Property(w => w.EstimatedCost)
            .HasPrecision(18, 2);
        
        builder.Property(w => w.ActualCost)
            .HasPrecision(18, 2);
        
        // Relationship with RoadSegment
        builder.HasOne(w => w.RoadSegment)
            .WithMany(r => r.WorkOrders)
            .HasForeignKey(w => w.RoadSegmentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(m => m.Agency)
            .WithMany()
            .HasForeignKey(m => m.AgencyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(w => w.Status);
        builder.HasIndex(w => w.Priority);
        builder.HasIndex(w => w.WorkType);
        builder.HasIndex(w => w.CreatedAt);
        builder.HasIndex(w => w.AssignedToUserId);
        builder.HasIndex(w => w.IsEmergency);
    }
}
