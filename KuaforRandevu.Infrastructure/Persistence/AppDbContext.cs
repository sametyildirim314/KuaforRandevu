using KuaforRandevu.Domain.Entities;
using KuaforRandevu.Domain.Enums;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace KuaforRandevu.Infrastructure.Persistence;

// IdentityDbContext kullanıyoruz — Identity tabloları (AspNetUsers vb.) otomatik oluşur
public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Salon> Salons => Set<Salon>();
    public DbSet<Barber> Barbers => Set<Barber>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<Review> Reviews => Set<Review>();

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

        builder.Entity<Barber>(e =>
        {
            e.Property(b => b.DisplayName).HasMaxLength(200);

            // Barber → AppUser (ON DELETE RESTRICT — kullanıcı silince berber silinmez)
            e.HasOne(b => b.User)
             .WithMany()
             .HasForeignKey(b => b.UserId)
             .OnDelete(DeleteBehavior.Restrict);

            // Barber → Salon
            e.HasOne(b => b.Salon)
             .WithMany()
             .HasForeignKey(b => b.SalonId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Appointment>(e =>
        {
            // AppointmentStatus enum'u int olarak saklanır
            e.Property(a => a.Status).HasConversion<int>();

            // Appointment → Customer (AppUser)
            e.HasOne(a => a.Customer)
             .WithMany()
             .HasForeignKey(a => a.CustomerId)
             .OnDelete(DeleteBehavior.Restrict);

            // Appointment → Barber
            e.HasOne(a => a.Barber)
             .WithMany(b => b.Appointments)
             .HasForeignKey(a => a.BarberId)
             .OnDelete(DeleteBehavior.Restrict);

            // Appointment → Salon
            e.HasOne(a => a.Salon)
             .WithMany()
             .HasForeignKey(a => a.SalonId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Review>(e =>
        {
            e.Property(r => r.Comment).HasMaxLength(500);

            // Her randevu için yalnızca 1 değlendirme: UNIQUE constraint
            e.HasIndex(r => r.AppointmentId).IsUnique();

            // Review → Author (AppUser)
            e.HasOne(r => r.Author)
             .WithMany()
             .HasForeignKey(r => r.AuthorId)
             .OnDelete(DeleteBehavior.Restrict);

            // Review → Barber
            e.HasOne(r => r.Barber)
             .WithMany()
             .HasForeignKey(r => r.BarberId)
             .OnDelete(DeleteBehavior.Restrict);

            // Review → Appointment
            e.HasOne(r => r.Appointment)
             .WithMany()
             .HasForeignKey(r => r.AppointmentId)
             .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
