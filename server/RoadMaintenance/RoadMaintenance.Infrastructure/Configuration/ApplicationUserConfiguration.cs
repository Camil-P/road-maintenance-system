using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoadMaintenance.Infrastructure.Identity;
using RoadMaintenance.Domain.Entities;

namespace RoadMaintenance.Infrastructure.Configuration;

public class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        // Povezivanje User-a sa Agencijom (Mnogi prema jedan)
        builder.HasOne<Agency>() // Opciono možeš dodati navigacioni property u ApplicationUser
               .WithMany()       // Ako Agency nema listu Usera
               .HasForeignKey(u => u.AgencyId)
               .OnDelete(DeleteBehavior.Restrict); // Ne dozvoli brisanje agencije ako ima korisnike
    }
}