using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoadMaintenance.Domain.Entities;

namespace RoadMaintenance.Infrastructure.Configuration;

public class AgencyConfiguration : IEntityTypeConfiguration<Agency>
{
    public void Configure(EntityTypeBuilder<Agency> builder)
    {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Name)
               .IsRequired()
               .HasMaxLength(200);

        builder.HasIndex(x => x.Name).IsUnique(); // Ime agencije treba biti unikatno

        // Ako koristiš NTS i Spatial Data, EF Core će automatski mapirati Polygon tip
        builder.Property(x => x.RegionBoundary)
               .HasColumnType("geometry"); // ili "geography" zavisno od baze (SQL Server/PostGIS)
    }
}