using KuaforRandevu.Application.DTOs.Barber;
using KuaforRandevu.Application.DTOs.Salon;
using KuaforRandevu.Application.Interfaces;
using KuaforRandevu.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KuaforRandevu.Infrastructure.Services;

public class SalonService : ISalonService
{
    private readonly AppDbContext _db;

    public SalonService(AppDbContext db) => _db = db;

    public async Task<IReadOnlyList<SalonListItemDto>> GetAllAsync(CancellationToken ct = default)
    {
        return await _db.Salons
            .AsNoTracking()
            .Where(s => s.IsActive)
            .OrderBy(s => s.Name)
            .Select(s => new SalonListItemDto
            {
                Id = s.Id, Name = s.Name, City = s.City,
                Address = s.Address, Phone = s.Phone,
            })
            .ToListAsync(ct);
    }

    public async Task<SalonDetailDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await _db.Salons
            .AsNoTracking()
            .Where(s => s.Id == id && s.IsActive)
            .Select(s => new SalonDetailDto
            {
                Id = s.Id, Name = s.Name, City = s.City,
                Address = s.Address, Phone = s.Phone,
                Description = s.Description,
                Services = s.Services.Where(serv => serv.IsActive).Select(serv => new ServiceDto
                {
                    Id = serv.Id, Name = serv.Name, Price = serv.Price, DurationMinutes = serv.DurationMinutes
                }).ToList()
            })
            .FirstOrDefaultAsync(ct);
    }

    // Salona ait aktif kuaförleri döner
    public async Task<IReadOnlyList<BarberListDto>> GetBarbersAsync(int salonId, CancellationToken ct = default)
    {
        return await _db.Barbers
            .AsNoTracking()
            .Where(b => b.SalonId == salonId && b.IsActive)
            .Select(b => new BarberListDto
            {
                Id = b.Id,
                DisplayName = b.DisplayName,
                SlotDurationMinutes = b.SlotDurationMinutes,
                WorkStartHour = b.WorkStartHour,
                WorkEndHour = b.WorkEndHour,
                AverageRating = b.AverageRating,
                ReviewCount = b.ReviewCount,
            })
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<SalonListItemDto>> SearchAsync(string? q, string? category, double? minRating, decimal? maxPrice, CancellationToken ct = default)
    {
        var query = _db.Salons
            .AsNoTracking()
            .Include(s => s.Services)
            .Where(s => s.IsActive);

        // 1. Arama anahtar kelimesi (Ad, Şehir, Adres, Açıklama)
        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim().ToLower();
            query = query.Where(s => s.Name.ToLower().Contains(term) ||
                                     s.City.ToLower().Contains(term) ||
                                     s.Address.ToLower().Contains(term) ||
                                     (s.Description != null && s.Description.ToLower().Contains(term)));
        }

        // 2. Kategori/Hizmet Filtresi
        if (!string.IsNullOrWhiteSpace(category))
        {
            var cat = category.Trim().ToLower();
            query = query.Where(s => s.Services.Any(serv => serv.IsActive && serv.Name.ToLower().Contains(cat)));
        }

        // 3. Puan Filtresi
        if (minRating.HasValue && minRating.Value > 0)
        {
            query = query.Where(s => _db.Barbers.Any(b => b.SalonId == s.Id && b.IsActive) && 
                                     _db.Barbers.Where(b => b.SalonId == s.Id && b.IsActive).Average(b => b.AverageRating) >= minRating.Value);
        }

        // 4. Maksimum Fiyat Filtresi
        if (maxPrice.HasValue && maxPrice.Value > 0)
        {
            query = query.Where(s => s.Services.Any(serv => serv.IsActive && serv.Price <= maxPrice.Value));
        }

        return await query
            .OrderBy(s => s.Name)
            .Select(s => new SalonListItemDto
            {
                Id = s.Id,
                Name = s.Name,
                City = s.City,
                Address = s.Address,
                Phone = s.Phone
            })
            .ToListAsync(ct);
    }
}
