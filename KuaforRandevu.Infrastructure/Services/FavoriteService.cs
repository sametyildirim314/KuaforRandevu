using KuaforRandevu.Application.DTOs.Salon;
using KuaforRandevu.Application.Interfaces;
using KuaforRandevu.Domain.Entities;
using KuaforRandevu.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace KuaforRandevu.Infrastructure.Services;

public class FavoriteService : IFavoriteService
{
    private readonly AppDbContext _db;

    public FavoriteService(AppDbContext db) => _db = db;

    public async Task AddFavoriteAsync(string customerId, int salonId, CancellationToken ct = default)
    {
        var salon = await _db.Salons.FindAsync(new object[] { salonId }, ct)
            ?? throw new Exception("Salon bulunamadı.");

        var exists = await _db.Favorites.AnyAsync(f => f.CustomerId == customerId && f.SalonId == salonId, ct);
        if (exists) return;

        var fav = new Favorite
        {
            CustomerId = customerId,
            SalonId = salonId
        };

        _db.Favorites.Add(fav);
        await _db.SaveChangesAsync(ct);
    }

    public async Task RemoveFavoriteAsync(string customerId, int salonId, CancellationToken ct = default)
    {
        var fav = await _db.Favorites.FirstOrDefaultAsync(f => f.CustomerId == customerId && f.SalonId == salonId, ct);
        if (fav == null) return;

        _db.Favorites.Remove(fav);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<SalonListItemDto>> GetMyFavoritesAsync(string customerId, CancellationToken ct = default)
    {
        return await _db.Favorites
            .AsNoTracking()
            .Include(f => f.Salon)
            .Where(f => f.CustomerId == customerId && f.Salon.IsActive)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new SalonListItemDto
            {
                Id = f.Salon.Id,
                Name = f.Salon.Name,
                City = f.Salon.City,
                Address = f.Salon.Address,
                Phone = f.Salon.Phone
            })
            .ToListAsync(ct);
    }

    public async Task<bool> IsFavoriteAsync(string customerId, int salonId, CancellationToken ct = default)
    {
        return await _db.Favorites.AnyAsync(f => f.CustomerId == customerId && f.SalonId == salonId, ct);
    }
}
