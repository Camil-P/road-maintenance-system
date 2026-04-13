using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoadMaintenance.Domain.Entities;

namespace RoadMaintenance.Infrastructure.Configuration;

public class IncidentReportConfiguration : IEntityTypeConfiguration<IncidentReport>
{
    public void Configure(EntityTypeBuilder<IncidentReport> builder)
    {
        builder.HasKey(i => i.Id);
        
        builder.Property(i => i.Description)
            .IsRequired()
            .HasMaxLength(2000);
        
        builder.Property(i => i.LocationDescription)
            .HasMaxLength(1000);
        
        builder.Property(i => i.ReportedByUserId)
            .IsRequired()
            .HasMaxLength(450); // Standard Identity user ID length
        
        builder.Property(i => i.VerifiedByUserId)
            .HasMaxLength(450);
        
        builder.Property(i => i.Type)
            .IsRequired();
        
        builder.Property(i => i.Status)
            .IsRequired();
        
        // Relationship with RoadSegment
        builder.HasOne(i => i.RoadSegment)
            .WithMany(r => r.Incidents)
            .HasForeignKey(i => i.RoadSegmentId)
            .OnDelete(DeleteBehavior.SetNull);
        
        // Relationship with WorkOrder
        builder.HasOne(i => i.WorkOrder)
            .WithMany(w => w.IncidentReports)
            .HasForeignKey(i => i.WorkOrderId)
            .OnDelete(DeleteBehavior.SetNull);
        
        // Self-referencing relationship for duplicate detection
        builder.HasOne(i => i.RelatedIncident)
            .WithMany(i => i.RelatedIncidents)
            .HasForeignKey(i => i.RelatedIncidentId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.Property(i => i.GeometryJson)
            .HasColumnType("jsonb");

        builder.HasIndex(i => i.Status);
        builder.HasIndex(i => i.Type);
        builder.HasIndex(i => i.ReportedAt);
        builder.HasIndex(i => i.ReportedByUserId);
        builder.HasIndex(i => i.RoadSegmentId);
    }
}
