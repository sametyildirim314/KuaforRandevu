using KuaforRandevu.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace KuaforRandevu.Infrastructure.Persistence;

// IdentityDbContext kullanıyoruz — Identity tabloları (AspNetUsers vb.) otomatik oluşur
public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Tablo isimlerini özelleştir (isteğe bağlı, daha temiz görünür)
        builder.Entity<AppUser>().ToTable("Users");
    }
}