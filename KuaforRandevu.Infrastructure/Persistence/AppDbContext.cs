using KuaforRandevu.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace KuaforRandevu.Infrastructure.Persistence;

// IdentityDbContext kullanıyoruz — Identity tabloları (AspNetUsers vb.) otomatik oluşur
public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Salon> Salons => Set<Salon>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<AppUser>().ToTable("Users");

        builder.Entity<Salon>(e =>
        {
            e.Property(x => x.Name).HasMaxLength(200);
            e.Property(x => x.City).HasMaxLength(100);
            e.Property(x => x.Address).HasMaxLength(500);
        });
    }
}
